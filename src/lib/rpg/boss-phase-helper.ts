import type { ActiveEnemy } from "./runtime-types";

export function checkBossPhase2Transform(enemy: ActiveEnemy): {
  enemy: ActiveEnemy;
  transformLog?: string;
} {
  if (!enemy.phase2 || enemy.hasTransformed || enemy.currentHp <= 0) {
    return { enemy };
  }

  const thresholdHp = Math.ceil((enemy.hp * enemy.phase2.triggerHpPercent) / 100);
  if (enemy.currentHp > thresholdHp) {
    return { enemy };
  }

  const p2 = enemy.phase2;
  return {
    enemy: {
      ...enemy,
      hasTransformed: true,
      name: p2.name,
      sprite: p2.sprite,
      spriteFrame2: undefined,
      atk: enemy.atk + p2.atkBonus,
      def: enemy.def + p2.defBonus,
      element: p2.element,
    },
    transformLog: `🔥 PHASE 2! ${enemy.name} transformed into ${p2.name}: "${p2.battleCry}" (+${p2.atkBonus} ATK, +${p2.defBonus} DEF)`,
  };
}
