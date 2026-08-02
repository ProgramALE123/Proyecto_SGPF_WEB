export const log = (level, message, fields = {}) => {
  const entry = { level, message, timestamp: new Date().toISOString(), ...fields };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
};
