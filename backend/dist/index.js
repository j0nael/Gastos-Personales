"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
require("dotenv/config");
const env_1 = __importDefault(require("./Config/env"));
server_1.default.listen(env_1.default.PORT, () => {
    console.log(`La API esta funcionando en ${env_1.default.PORT}`);
});
//# sourceMappingURL=index.js.map