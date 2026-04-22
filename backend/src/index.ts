import app from "./server";
import 'dotenv/config';
import env from "./Config/env";

app.listen(env.PORT, () => {
    console.log(`La API esta funcionando en ${env.PORT}`)
})