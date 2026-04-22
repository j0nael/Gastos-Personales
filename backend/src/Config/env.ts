const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGO_URI: process.env.MONGO_URI || ""
};

// Si esta nulo, falla
if (!env.MONGO_URI) {
  throw new Error("MONGO_URI no está definida en el .env");
}

export default env;