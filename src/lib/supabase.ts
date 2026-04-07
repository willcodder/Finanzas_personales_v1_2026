import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hicijarieecjfhkaefsw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-2miYdpSur7pXIIE5ESe8Q_Q1JQYhcI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
