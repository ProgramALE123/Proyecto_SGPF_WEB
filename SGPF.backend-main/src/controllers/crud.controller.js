import { asyncHandler } from '../utils/errors.js';
import { ensureUuid } from '../utils/validation.js';

export const createCrudController = (definition, service) => ({
  listar: asyncHandler(async (req, res) => {
    const result = await service.list(req.query);
    res.json({ mensaje: `Listado de ${definition.label}s`, total: result.total, [definition.table]: result.data });
  }),
  buscarPorId: asyncHandler(async (req, res) => {
    const row = await service.get(ensureUuid(req.params.id));
    res.json({ mensaje: `${definition.label} encontrado`, [definition.label.replaceAll(' ', '_')]: row });
  }),
  registrar: asyncHandler(async (req, res) => {
    const row = await service.create(req.body);
    res.status(201).json({ mensaje: `${definition.label} creado correctamente`, [definition.label.replaceAll(' ', '_')]: row });
  }),
  editar: asyncHandler(async (req, res) => {
    const row = await service.update(ensureUuid(req.params.id), req.body);
    res.json({ mensaje: `${definition.label} actualizado correctamente`, [definition.label.replaceAll(' ', '_')]: row });
  }),
  borrar: asyncHandler(async (req, res) => {
    const row = await service.remove(ensureUuid(req.params.id), req.body);
    res.json({ mensaje: `${definition.label} eliminado correctamente`, [definition.label.replaceAll(' ', '_')]: row });
  })
});
