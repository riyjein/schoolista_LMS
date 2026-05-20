import { useState } from 'react';
import { settingsByCategory, type SettingCategory } from '@/lib/data/admin/settings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Settings,
  Save,
  RotateCcw,
  GraduationCap,
  UserCheck,
  Award,
  Calendar,
  DollarSign,
  Server,
  Bell,
} from 'lucide-react';

export default function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SettingCategory>('academic');

  const getCategoryIcon = (category: SettingCategory) => {
    switch (category) {
      case 'academic':
        return GraduationCap;
      case 'enrollment':
        return UserCheck;
      case 'grading':
        return Award;
      case 'attendance':
        return Calendar;
      case 'financial':
        return DollarSign;
      case 'system':
        return Server;
      case 'notifications':
        return Bell;
    }
  };

  const selectedCategoryData = settingsByCategory.find((c) => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure system preferences and parameters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Category Navigation */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {settingsByCategory.map((category) => {
                const Icon = getCategoryIcon(category.category);
                return (
                  <button
                    key={category.category}
                    onClick={() => setSelectedCategory(category.category)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedCategory === category.category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{category.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.settings.length}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {selectedCategoryData && (
                  <>
                    {(() => {
                      const Icon = getCategoryIcon(selectedCategoryData.category);
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    <CardTitle className="text-base">{selectedCategoryData.label}</CardTitle>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedCategoryData && (
                <div className="space-y-6">
                  {selectedCategoryData.settings.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{setting.label}</h3>
                          {!setting.isEditable && (
                            <Badge variant="outline" className="text-xs">
                              Read-only
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                        {setting.lastModifiedBy && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last modified by {setting.lastModifiedBy} on {setting.lastModifiedAt}
                          </p>
                        )}
                      </div>
                      <div className="w-64">
                        {setting.type === 'boolean' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={setting.value as boolean}
                              disabled={!setting.isEditable}
                            />
                            <span className="text-sm text-muted-foreground">
                              {setting.value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        ) : setting.type === 'select' && setting.options ? (
                          <Select
                            value={setting.value as string}
                            disabled={!setting.isEditable}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {setting.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : setting.type === 'number' ? (
                          <Input
                            type="number"
                            value={setting.value as number}
                            disabled={!setting.isEditable}
                          />
                        ) : setting.type === 'date' ? (
                          <Input
                            type="date"
                            value={setting.value as string}
                            disabled={!setting.isEditable}
                          />
                        ) : (
                          <Input
                            type="text"
                            value={setting.value as string}
                            disabled={!setting.isEditable}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
