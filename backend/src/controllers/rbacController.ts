import { Request, Response } from 'express';
import pool from '../db/pool';

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM roles ORDER BY name');
  res.json({ roles: result.rows });
};

export const getPermissions = async (req: Request, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM permissions ORDER BY category, name');
  res.json({ permissions: result.rows });
};

export const getRolePermissions = async (req: Request, res: Response): Promise<void> => {
  const { roleId } = req.params;
  const result = await pool.query(`
    SELECT p.id, p.name, p.description, p.category
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = $1
    ORDER BY p.category, p.name
  `, [roleId]);
  res.json({ permissions: result.rows });
};

export const grantPermission = async (req: Request, res: Response): Promise<void> => {
  const { role_id, permission_id } = req.body;
  await pool.query(`
    INSERT INTO role_permissions (role_id, permission_id, granted_by)
    VALUES ($1, $2, $3) ON CONFLICT DO NOTHING
  `, [role_id, permission_id, req.user!.id]);
  res.json({ message: 'Permission accordée' });
};

export const revokePermission = async (req: Request, res: Response): Promise<void> => {
  const { role_id, permission_id } = req.body;
  await pool.query(
    'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
    [role_id, permission_id]
  );
  res.json({ message: 'Permission révoquée' });
};

export const getAllRolesWithPermissions = async (req: Request, res: Response): Promise<void> => {
  const roles = await pool.query('SELECT * FROM roles ORDER BY name');
  const permissions = await pool.query('SELECT * FROM permissions ORDER BY category, name');
  const rolePerms = await pool.query('SELECT role_id, permission_id FROM role_permissions');

  const matrix = roles.rows.map(role => ({
    ...role,
    permissions: rolePerms.rows
      .filter(rp => rp.role_id === role.id)
      .map(rp => rp.permission_id),
  }));

  res.json({ roles: matrix, permissions: permissions.rows });
};
