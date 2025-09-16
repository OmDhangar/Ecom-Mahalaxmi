import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
}) {
  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name];

    switch (getControlItem.componentType) {
      case "input":
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );

        break;
      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );

        break;
      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );

        break;
        case "multiselect":
        const fieldPath = getControlItem.name.split('.');
        const fieldValue = formData[getControlItem.name] ;
        
        element = (
          <div className="grid grid-cols-2 gap-2">
            {getControlItem.options && getControlItem.options.length > 0
              ? getControlItem.options.map((optionItem) => {
                  const isChecked = Array.isArray(fieldValue) && 
                    fieldValue.includes(optionItem.id);
                  
                  return (
                    <div key={optionItem.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`${getControlItem.name}-${optionItem.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let newValue;
                          if (Array.isArray(fieldValue)) {
                            newValue = checked 
                              ? [...fieldValue, optionItem.id]
                              : fieldValue.filter(val => val !== optionItem.id);
                          } else {
                            newValue = checked ? [optionItem.id] : [];
                          }
                          
                          // Handle nested object paths
                          if (fieldPath.length > 1) {
                            const newFormData = {...formData};
                            let current = newFormData;
                            
                            // Navigate to the parent object
                            for (let i = 0; i < fieldPath.length - 1; i++) {
                              if (!current[fieldPath[i]]) {
                                current[fieldPath[i]] = {};
                              }
                              current = current[fieldPath[i]];
                            }
                            
                            // Set the value on the parent object
                            current[fieldPath[fieldPath.length - 1]] = newValue;
                            setFormData(newFormData);
                          } else {
                            setFormData({
                              ...formData,
                              [getControlItem.name]: newValue,
                            });
                          }
                        }}
                      />
                      <label 
                        htmlFor={`${getControlItem.name}-${optionItem.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {optionItem.label}
                      </label>
                    </div>
                  );
                })
              : null}
          </div>
        );
        break;
      case "fashionsizes":
        const sizesValue = formData[getControlItem.name] || [];
        
        element = (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => {
                    const existingSizeObj = Array.isArray(sizesValue) 
                      ? sizesValue.find(item => item.size === optionItem.id)
                      : null;
                    const isSelected = !!existingSizeObj;
                    const currentStock = existingSizeObj ? existingSizeObj.stock : 0;
                    
                    return (
                      <div key={optionItem.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${getControlItem.name}-${optionItem.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              let newValue;
                              if (Array.isArray(sizesValue)) {
                                if (checked) {
                                  // Add size with default stock of 0
                                  newValue = [...sizesValue, { size: optionItem.id, stock: 0 }];
                                } else {
                                  // Remove size
                                  newValue = sizesValue.filter(item => item.size !== optionItem.id);
                                }
                              } else {
                                newValue = checked ? [{ size: optionItem.id, stock: 0 }] : [];
                              }
                              
                              setFormData({
                                ...formData,
                                [getControlItem.name]: newValue,
                              });
                            }}
                          />
                          <label 
                            htmlFor={`${getControlItem.name}-${optionItem.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Size {optionItem.label}
                          </label>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center space-x-2 flex-1">
                            <label className="text-xs text-gray-500 min-w-[40px]">Stock:</label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={currentStock}
                              className="w-20 h-8 text-sm"
                              onChange={(e) => {
                                const newStock = parseInt(e.target.value) || 0;
                                const newValue = sizesValue.map(item => 
                                  item.size === optionItem.id 
                                    ? { ...item, stock: newStock }
                                    : item
                                );
                                
                                setFormData({
                                  ...formData,
                                  [getControlItem.name]: newValue,
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                : null}
            </div>
            {sizesValue.length > 0 && (
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <strong>Total Stock:</strong> {sizesValue.reduce((total, item) => total + (item.stock || 0), 0)}
              </div>
            )}
          </div>
        );
        break;

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
    }

    return element;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>
      <Button disabled={isBtnDisabled} type="submit" className="mt-2 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
