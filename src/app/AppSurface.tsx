import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

type AppSurfaceProps = {
  publishing: ReactNode;
  editing: ReactNode;
  admin: ReactNode;
  security: ReactNode;
  creator: ReactNode;
  manual: ReactNode;
  market: ReactNode;
};

export function AppSurface({
  publishing,
  editing,
  admin,
  security,
  creator,
  manual,
  market,
}: AppSurfaceProps) {
  return (
    <Routes>
      <Route path="/" element={market} />
      <Route path="/category/:type" element={market} />
      <Route path="/skills/:category" element={market} />
      <Route path="/creator" element={creator} />
      <Route path="/admin" element={admin} />
      <Route path="/security-review" element={security} />
      <Route path="/guide/*" element={manual} />
      <Route path="/publish" element={publishing} />
      <Route path="/publish/:type/:id" element={publishing} />
      <Route path="/edit/:type/:id" element={editing} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
