import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

type AppSurfaceProps = {
  publishing: ReactNode;
  admin: ReactNode;
  creator: ReactNode;
  market: ReactNode;
};

export function AppSurface({
  publishing,
  admin,
  creator,
  market,
}: AppSurfaceProps) {
  return (
    <Routes>
      <Route path="/" element={market} />
      <Route path="/category/:type" element={market} />
      <Route path="/skills/:category" element={market} />
      <Route path="/creator" element={creator} />
      <Route path="/admin" element={admin} />
      <Route path="/publish" element={publishing} />
      <Route path="/publish/:type/:id" element={publishing} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
