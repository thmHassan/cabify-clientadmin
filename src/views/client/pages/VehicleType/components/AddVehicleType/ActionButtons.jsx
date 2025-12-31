import Button from "../../../../../../components/ui/Button/Button";

const ActionButtons = ({ 
  handleCancel, 
  isSaving, 
  isLoading,
  isEditMode 
}) => {
  return (
    <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-start">
      <Button
        btnSize="md"
        type="filledGray"
        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
        onClick={handleCancel}
        disabled={isSaving || isLoading}
      >
        <span>Cancel</span>
      </Button>
      <Button
        btnType="submit"
        btnSize="md"
        type="filled"
        className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
        disabled={isSaving || isLoading}
      >
        <span>{isSaving ? "Saving..." : "Save"}</span>
      </Button>
    </div>
  );
};

export default ActionButtons;