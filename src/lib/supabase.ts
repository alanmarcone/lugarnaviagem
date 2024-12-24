import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojlgfebwmrgkgloffsyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbGdmZWJ3bXJna2dsb2Zmc3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NTI0NzAsImV4cCI6MjAyNTIyODQ3MH0.Wd_jqkZQKqX_qBqD9NeTrack4Hy0Hy0Hy0Hy0Hy0Hy0';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  created_at: string;
  nome: string | null;
  whatsapp: string | null;
};

export type Assento = {
  id: number;
  created_at: string;
  numero: number;
  ocupado: boolean;
  user_id: string | null;
  preco: number;
};