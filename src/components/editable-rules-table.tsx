'use client';

import { useState } from 'react';
import type { Rule } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditableRulesTableProps {
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
}

export function EditableRulesTable({ rules, onRulesChange }: EditableRulesTableProps) {
  const [editableRules, setEditableRules] = useState(rules);

  const handleRuleChange = (index: number, field: keyof Rule, value: any) => {
    const updatedRules = [...editableRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setEditableRules(updatedRules);
    onRulesChange(updatedRules);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Product IDs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {editableRules.map((rule, index) => (
          <TableRow key={rule.id}>
            <TableCell>
              <Select
                value={rule.type}
                onValueChange={(value) => handleRuleChange(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUNDLE">Bundle</SelectItem>
                  <SelectItem value="DEPENDENCY">Dependency</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                value={rule.description}
                onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Input
                value={rule.productIds.join(', ')}
                onChange={(e) => handleRuleChange(index, 'productIds', e.target.value.split(',').map(s => s.trim()))}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
