import { DoctorApp } from "./DoctorApp";

/**
 * 社区端 = 一个社区医生融合康复医师 + 治疗师 + 护士 三个角色的职责。
 * 不再提供顶部角色切换，直接复用医师端工作台作为统一入口。
 * 社区端所有患者统一进入【院外】阶段。
 */
export const CommunityApp = () => <DoctorApp community />;
