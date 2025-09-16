import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toyColorOptions } from '@/config';

const ToyColors = ({ value = [], onChange }) => {
  const handleAddColor = () => {
    onChange([...value, { color: toyColorOptions[0].id, stock: 0 }]);
  };

  const handleRemoveColor = (index) => {
    const newColors = value.filter((_, i) => i !== index);
    onChange(newColors);
  };

  const handleColorChange = (index, field, newValue) => {
    const newColors = [...value];
    newColors[index] = { ...newColors[index], [field]: field === 'stock' ? Number(newValue) : newValue };
    onChange(newColors);
  };

  return (
    <div className="space-y-4">
      {value.map((colorItem, index) => (
        <div key={index} className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Color</Label>
            <select
              className="w-full border rounded-md p-2"
              value={colorItem.color}
              onChange={(e) => handleColorChange(index, 'color', e.target.value)}
            >
              {toyColorOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label>Stock</Label>
            <Input
              type="number"
              min="0"
              value={colorItem.stock}
              onChange={(e) => handleColorChange(index, 'stock', e.target.value)}
            />
          </div>
          <Button
            variant="destructive"
            onClick={() => handleRemoveColor(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddColor}
      >
        Add Color
      </Button>
    </div>
  );
};

export default ToyColors;