'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Condition, CombatRule } from '@/types';
import { CONDITIONS, COMBAT_RULES, SKILLS } from '@/data/rules';

export default function RulesPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Rules Quick-Reference" />
      <Tabs defaultValue="conditions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="combat">Combat Rules</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions">
          <ConditionsTab />
        </TabsContent>
        <TabsContent value="combat">
          <CombatRulesTab />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConditionsTab() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return CONDITIONS;
    const q = search.toLowerCase();
    return CONDITIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search conditions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((condition) => (
          <Card key={condition.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{condition.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {condition.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No conditions match your search.
        </p>
      )}
    </div>
  );
}

function CombatRulesTab() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleExpand(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="max-w-2xl space-y-2">
      {COMBAT_RULES.map((rule, index) => (
        <Card key={rule.title}>
          <button
            className="w-full text-left"
            onClick={() => toggleExpand(index)}
          >
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{rule.title}</CardTitle>
                <span className="text-muted-foreground text-sm">
                  {expandedIndex === index ? '−' : '+'}
                </span>
              </div>
            </CardHeader>
          </button>
          {expandedIndex === index && (
            <CardContent className="pt-0 pb-4">
              <Separator className="mb-3" />
              <p className="text-sm leading-relaxed whitespace-pre-line">{rule.content}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function SkillsTab() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return SKILLS;
    const q = search.toLowerCase();
    return SKILLS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.stat.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skill) => (
          <Card key={skill.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{skill.name}</CardTitle>
                <Badge variant="secondary">{skill.stat}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {skill.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No skills match your search.
        </p>
      )}
    </div>
  );
}
