import Button from "../../../../../../components/ui/Button/Button";
import { useState } from "react";

const AttributesSection = ({
  attributes,
  setAttributes,
  attributesEnabled,
}) => {
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");

  const handleAttributeChange = (attr, value) => {
    setAttributes((prev) => ({
      ...prev,
      [attr]: value,
    }));
  };

  const handleAddAttribute = () => {
    const trimmed = (newAttributeName || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (!trimmed) return;
    if (attributes[trimmed]) {
      setIsAttributeModalOpen(false);
      setNewAttributeName("");
      return;
    }
    setAttributes((prev) => ({
      ...prev,
      [trimmed]: "",
    }));
    setIsAttributeModalOpen(false);
    setNewAttributeName("");
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-900">Attributes</h3>
        </div>
        <Button
          type="filled"
          btnSize="sm"
          className="!px-10 pt-3 pb-[13px] leading-[25px] w-full sm:w-auto rounded-lg"
          onClick={() => {
            setNewAttributeName("");
            setIsAttributeModalOpen(true);
          }}
        >
          + Add Attribute
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(attributes).map((attrKey) => (
          <div
            key={attrKey}
            className="bg-white rounded-xl p-3 shadow-sm border"
          >
            <p className="font-semibold mb-3 text-gray-800 capitalize">
              {attrKey.replace(/_/g, " ")}
            </p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={attrKey}
                  value="yes"
                  checked={attributes[attrKey] === "yes"}
                  onChange={(e) =>
                    handleAttributeChange(attrKey, e.target.value)
                  }
                  className="accent-blue-600"
                  disabled={!attributesEnabled}
                />
                <span>Yes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={attrKey}
                  value="no"
                  checked={attributes[attrKey] === "no"}
                  onChange={(e) =>
                    handleAttributeChange(attrKey, e.target.value)
                  }
                  className="accent-blue-600"
                  disabled={!attributesEnabled}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Attribute Modal */}
      {isAttributeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Add Attribute</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attribute Name
            </label>
            <input
              type="text"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              className="w-full border border-[#8D8D8D] rounded-lg px-4 py-3 shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
              placeholder="Enter attribute"
            />
            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="filledGray"
                className="!px-10 pt-4 pb-[15px] rounded-md leading-[25px] w-full sm:w-auto"
                onClick={() => {
                  setIsAttributeModalOpen(false);
                  setNewAttributeName("");
                }}
              >
                Cancel
              </Button>
              <Button
                btnSize="md"
                type="filled"
                className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                onClick={handleAddAttribute}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributesSection;