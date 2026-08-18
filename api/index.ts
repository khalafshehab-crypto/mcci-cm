import app from "../server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};

export const maxDuration = 60;

export default app;
