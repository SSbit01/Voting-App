export default function PlusMinus({plus, minus, disabled_plus, disabled_minus}) {
  return (
    <div className="plus_minus">
      <button type="button" onClick={plus} disabled={disabled_plus}>+</button>
      <button type="button" onClick={minus} disabled={disabled_minus}>–</button>
    </div>
  );
}