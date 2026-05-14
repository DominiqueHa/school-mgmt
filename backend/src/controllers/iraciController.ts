import { Request, Response } from 'express';
import pool from '../db/pool';
import { createIraciRequest, advanceIraciRequest } from '../services/iraciService';

export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT ir.id, ir.current_step, ir.status, ir.created_at, ir.deadline,
            iat.code as action_code, iat.label as action_label,
            u.username as target_username
     FROM iraci_requests ir
     JOIN iraci_action_types iat ON ir.action_type_id = iat.id
     LEFT JOIN users u ON ir.target_user_id = u.id
     WHERE ir.initiator_id = $1
     ORDER BY ir.created_at DESC`,
    [req.user!.id]
  );
  res.json({ requests: result.rows });
};

export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT ir.id, ir.current_step, ir.status, ir.created_at, ir.deadline,
            iat.code as action_code, iat.label as action_label,
            u.username as initiator_username,
            tu.username as target_username
     FROM iraci_requests ir
     JOIN iraci_action_types iat ON ir.action_type_id = iat.id
     JOIN users u ON ir.initiator_id = u.id
     LEFT JOIN users tu ON ir.target_user_id = tu.id
     WHERE ir.status IN ('pending', 'in_progress')
     ORDER BY ir.created_at ASC`
  );
  res.json({ requests: result.rows });
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const request = await pool.query(
    `SELECT ir.*, iat.code as action_code, iat.label as action_label,
            iat.steps as action_steps
     FROM iraci_requests ir
     JOIN iraci_action_types iat ON ir.action_type_id = iat.id
     WHERE ir.id = $1`,
    [id]
  );

  if (request.rows.length === 0) {
    res.status(404).json({ error: 'Requête introuvable' });
    return;
  }

  const history = await pool.query(
    `SELECT ih.*, u.username as actor_username
     FROM iraci_history ih
     JOIN users u ON ih.actor_id = u.id
     WHERE ih.request_id = $1
     ORDER BY ih.created_at ASC`,
    [id]
  );

  res.json({ request: request.rows[0], history: history.rows });
};

export const advanceRequest = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const { action, comment } = req.body;

  const request = await pool.query(
    'SELECT initiator_id FROM iraci_requests WHERE id = $1',
    [id]
  );

  if (request.rows.length === 0) {
    res.status(404).json({ error: 'Requête introuvable' });
    return;
  }

  if (request.rows[0].initiator_id === req.user!.id && action === 'approved') {
    res.status(403).json({ error: 'Auto-validation interdite' });
    return;
  }

  await advanceIraciRequest(id, req.user!.id, action, comment);
  res.json({ message: `Requête ${action} avec succès` });
};

export const initRequest = async (req: Request, res: Response): Promise<void> => {
  const { action_code, target_user_id, data, deadline_days } = req.body;

  const requestId = await createIraciRequest({
    action_code,
    initiator_id: req.user!.id,
    target_user_id,
    data,
    deadline_days,
  });

  res.status(201).json({ message: 'Requête IRACI créée', request_id: requestId });
};
