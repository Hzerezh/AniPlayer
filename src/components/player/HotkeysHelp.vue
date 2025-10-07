<template>
  <div class="hotkeys">
    <div class="hint">AniPlayer · горячие клавиши</div>
    <ul>
      <li><span>Space / K</span><strong>Старт / Пауза</strong></li>
      <li><span>J / L</span><strong>±10 сек</strong></li>
      <li><span>← / →</span><strong>±5 сек</strong></li>
      <li><span>M</span><strong>Звук вкл/выкл</strong></li>
    </ul>
  </div>
</template>

<style scoped>
.hotkeys {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(10px);
  color: #f8fafc;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.6rem;
  background: rgba(79, 70, 229, 0.45);
  border-radius: 999px;
  letter-spacing: 0.03em;
  font-weight: 600;
}

strong {
  color: rgba(226, 232, 240, 0.95);
  font-weight: 500;
}

@media (max-width: 768px) {
  .hotkeys {
    display: none;
  }
}
</style>