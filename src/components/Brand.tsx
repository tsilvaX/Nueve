export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Nueve">
      <span className="brand__mark" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i /><i />
      </span>
      <span>NUEVE</span>
    </div>
  );
}
