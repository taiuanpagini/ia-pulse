import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) {
    return global._mongooseConn;
  }

  if (!global._mongoosePromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI não está definida nas variáveis de ambiente.");
    }

    global._mongoosePromise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((conn) => {
        global._mongooseConn = conn;
        global._mongoosePromise = undefined;
        return conn;
      });
  }

  return global._mongoosePromise;
}
