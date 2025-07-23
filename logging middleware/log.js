const eS = [];

const url1 = 'http://20.244.56.144/evaluation-service/logs';

const Log = async (stack, level, packageName, message) => {
  const payload = {
    stack,
    level,
    package: packageName,
    message,
  };

  try {
    await axios.post(url1, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Failed to send log:", err);
  }
};