import { useState, useMemo } from 'react';

export interface ScheduleFilters {
  search: string;
  day: string;
  subject: string;
}

export const useScheduleFilters = () => {
  const [search, setSearch] = useState('');
  const [day, setDay] = useState<string>('all');
  const [subject, setSubject] = useState<string>('all');

  const filters: ScheduleFilters = useMemo(
    () => ({
      search,
      day,
      subject,
    }),
    [search, day, subject],
  );

  const resetFilters = () => {
    setSearch('');
    setDay('all');
    setSubject('all');
  };

  return {
    filters,
    search,
    setSearch,
    day,
    setDay,
    subject,
    setSubject,
    resetFilters,
  };
};
