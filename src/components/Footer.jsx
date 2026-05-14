import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { subscribeToSettings, DEFAULT_WA_NUMBER } from "../lib/settings";
import { buildWAUrl } from "../lib/whatsapp";

function Footer() {
  const [waFooter, setWaFooter] = useState(DEFAULT_WA_NUMBER);

  useEffect(() => {
    // Leitura direta do Supabase
    supabase
      .from("settings")
      .select("value")
      .eq("key", "wa_footer")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setWaFooter(data.value);
      });

    // Atualização ao vivo quando admin salva
    return subscribeToSettings((settings) => {
      if (settings.wa_footer) setWaFooter(settings.wa_footer);
    });
  }, []);

  const waUrl = buildWAUrl(waFooter);
  const curriculumUrl = buildWAUrl(
    waFooter,
    "Olá! Gostaria de enviar meu currículo para trabalhar na G.A Brasil. Poderia me informar como proceder?"
  );

  return (
    <footer id="contato" className="footer">
      <div className="footerContent">
        <div className="footerAbout">
          <h3>Sobre nós</h3>
          <p>
            A G.A Brasil é uma distribuidora de maquiagens e cosméticos localizada em São Paulo, focada em atender lojistas, revendedoras e profissionais da beleza com qualidade e agilidade. Trabalhamos com marcas reconhecidas no mercado — como Max Love, Vivai, Fenzza, Lady Beauty e outras — oferecendo produtos selecionados, preços competitivos e atendimento personalizado via WhatsApp. Nossa missão é ser a parceira de confiança de quem vende beleza.
          </p>
        </div>

        <div className="footerBrand">
          <h2 className="footerLogo">G.A Brasil</h2>

          <p>
            Distribuidora de maquiagens e acessórios para lojistas e
            revendedores.
          </p>

          <div className="footerSocials">
            <a href={waUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.862L.057 23.552a.75.75 0 0 0 .921.921l5.69-1.475A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.205-1.432l-.372-.218-3.853.999 1.02-3.735-.24-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>

            <a href="https://www.instagram.com/gabrasiloficial/?hl=en" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>

            <a href="https://www.facebook.com/gabrasilmakeup/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footerColumn">
          <h3>Contato</h3>
          <a href={waUrl} target="_blank" rel="noreferrer">
            Whatsapp
          </a>
          <a href="https://www.instagram.com/gabrasiloficial/?hl=en" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.facebook.com/gabrasilmakeup/" target="_blank" rel="noreferrer">
            Facebook
          </a>
          <span>São Paulo - SP</span>
        </div>

        <div className="footerColumn">
          <h3>Atendimento</h3>
          <span>Segunda à Quinta — 08h às 18h</span>
          <span>Sexta — 08h às 17h</span>
          <span>Pedidos via WhatsApp</span>
        </div>

        <div className="footerColumn">
          <h3>Navegação</h3>
          <a href="#inicio">Início</a>
          <a href="#produtos">Produtos</a>
          <a
            href={curriculumUrl}
            target="_blank"
            rel="noreferrer"
            className="footerJobLink"
          >
            Trabalhe conosco
          </a>
        </div>
      </div>

      <div className="footerBottom">
        <p>© 2026 G.A Brasil - Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
export default Footer;
