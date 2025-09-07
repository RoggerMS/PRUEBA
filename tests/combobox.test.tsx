import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Combobox } from '@/components/ui/combobox';

describe('Combobox clear functionality', () => {
  const options = [
    { value: '1', label: 'Uno' },
    { value: '2', label: 'Dos' },
  ];

  test('calls onClear and onValueChange when clear button is clicked', () => {
    const onValueChange = jest.fn();
    const onClear = jest.fn();
    render(
      <Combobox
        options={options}
        value="1"
        onValueChange={onValueChange}
        clearable
        onClear={onClear}
        aria-label="Seleccionar opción"
      />
    );

    const clearBtn = screen.getByRole('button', { name: 'Limpiar selección' });
    fireEvent.click(clearBtn);

    expect(onValueChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  test('allows clearing with Backspace key', () => {
    const onValueChange = jest.fn();
    const onClear = jest.fn();
    render(
      <Combobox
        options={options}
        value="1"
        onValueChange={onValueChange}
        clearable
        onClear={onClear}
        aria-label="Seleccionar opción"
      />
    );

    const combobox = screen.getByRole('combobox', { name: 'Seleccionar opción' });
    combobox.focus();
    fireEvent.keyDown(combobox, { key: 'Backspace' });

    expect(onValueChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  test('does not clear when editing search input with Backspace', () => {
    const onValueChange = jest.fn();
    const onClear = jest.fn();
    render(
      <Combobox
        options={options}
        value="1"
        onValueChange={onValueChange}
        clearable
        onClear={onClear}
        aria-label="Seleccionar opción"
      />
    );

    const combobox = screen.getByRole('combobox', { name: 'Seleccionar opción' });
    fireEvent.click(combobox);

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });
});
