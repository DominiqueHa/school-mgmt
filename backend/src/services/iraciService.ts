import pool from '../db/pool';

export interface IraciRequestData {
  action_code: string;
  initiator_id: string;
  target_user_id?: string;
  data?: Record<string, unknown>;
  deadline_days?: number;
}

export const createIraciRequest = async (params: IraciRequestData): Promise<string> => {
  const { action_code, initiator_id, target_user_id, data = {}, deadline_days = 7 } = params;

  const actionType = await pool.query(
    'SELECT id FROM iraci_action_types WHERE code = $1 AND is_active = TRUE',
    [action_code]
  );

  if (actionType.rows.length === 0) {
    throw new Error(`Action type ${action_code} not found`);
  }

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + deadline_days);

  const result = await pool.query(
    `INSERT INTO iraci_requests
     (action_type_id, initiator_id, target_user_id, data, deadline, status, current_step)
     VALUES ($1, $2, $3, $4, $5, 'pending', 'initiation')
     RETURNING id`,
    [actionType.rows[0].id, initiator_id, target_user_id || null, JSON.stringify(data), deadline]
  );

  const requestId = result.rows[0].id;

  // Enregistrer l'historique
  await pool.query(
    `INSERT INTO iraci_history (request_id, step, actor_id, action, data)
     VALUES ($1, 'initiation', $2, 'initiated', $3)`,
    [requestId, initiator_id, JSON.stringify(data)]
  );

  return requestId;
};

export const advanceIraciRequest = async (
  requestId: string,
  actorId: string,
  action: 'approved' | 'rejected' | 'received' | 'controlled' | 'integrated',
  comment?: string
): Promise<void> => {
  const stepMap: Record<string, string> = {
    received: 'reception',
    approved: 'approbation',
    controlled: 'controle',
    integrated: 'integration',
    rejected: 'rejected',
  };

  const nextStep = stepMap[action] || 'completed';

  await pool.query(
    `UPDATE iraci_requests
     SET current_step = $1,
         status = CASE WHEN $1 = 'rejected' THEN 'rejected'
                       WHEN $1 = 'integration' THEN 'completed'
                       ELSE 'in_progress' END,
         updated_at = NOW()
     WHERE id = $2`,
    [nextStep, requestId]
  );

  await pool.query(
    `INSERT INTO iraci_history (request_id, step, actor_id, action, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [requestId, nextStep, actorId, action, comment || null]
  );
};

export const getIraciRequest = async (requestId: string) => {
  const result = await pool.query(
    `SELECT ir.*, iat.code as action_code, iat.label as action_label
     FROM iraci_requests ir
     JOIN iraci_action_types iat ON ir.action_type_id = iat.id
     WHERE ir.id = $1`,
    [requestId]
  );
  return result.rows[0] || null;
};
