export const ok = (res, data, message = 'Operação concluída com sucesso') => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const created = (res, data, message = 'Registro criado com sucesso') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

export const badRequest = (res, message = 'Dados inválidos') => {
  return res.status(400).json({
    success: false,
    message,
    error: 'BAD_REQUEST',
  });
};

export const notFound = (res, message = 'Registro não encontrado') => {
  return res.status(404).json({
    success: false,
    message,
    error: 'NOT_FOUND',
  });
};
