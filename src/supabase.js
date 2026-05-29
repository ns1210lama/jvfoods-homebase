import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const dbLoad = async (table) => {
  const { data, error } = await supabase.from(table).select('*');
  if (error) { console.error(`Load ${table}:`, error); return []; }
  return data.map(row => row.data);
};

export const dbSave = async (table, items) => {
  if (!items || items.length === 0) return;
  const rows = items.map(item => ({ id: item.id, data: item }));
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) console.error(`Save ${table}:`, error);
};

export const dbUpsertOne = async (table, item) => {
  const { error } = await supabase.from(table).upsert({ id: item.id, data: item }, { onConflict: 'id' });
  if (error) console.error(`Upsert ${table}:`, error);
};
