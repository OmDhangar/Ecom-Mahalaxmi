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
