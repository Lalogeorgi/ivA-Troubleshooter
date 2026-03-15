"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionSessionsModule = void 0;
const common_1 = require("@nestjs/common");
const intervention_sessions_controller_1 = require("./intervention-sessions.controller");
const intervention_sessions_service_1 = require("./intervention-sessions.service");
let InterventionSessionsModule = class InterventionSessionsModule {
};
exports.InterventionSessionsModule = InterventionSessionsModule;
exports.InterventionSessionsModule = InterventionSessionsModule = __decorate([
    (0, common_1.Module)({
        controllers: [intervention_sessions_controller_1.InterventionSessionsController],
        providers: [intervention_sessions_service_1.InterventionSessionsService]
    })
], InterventionSessionsModule);
//# sourceMappingURL=intervention-sessions.module.js.map