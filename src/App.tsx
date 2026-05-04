/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Landing from "./pages/Landing";
import MapPage from "./pages/MapPage";
import EmbedPage from "./pages/EmbedPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/embed" element={<EmbedPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
