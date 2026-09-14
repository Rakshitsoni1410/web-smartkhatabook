import "./GenerateBillButton.css";

const GenerateBillButton = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      className="generate-bill-btn"
      onClick={onClick}
      disabled={disabled}
    >
      Generate Bill
    </button>
  );
};

export default GenerateBillButton;