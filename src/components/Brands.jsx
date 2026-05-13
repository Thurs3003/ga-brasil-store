import { useScrollReveal } from '../hooks/useScrollReveal';

const brands = [
  "Max Love",
  "Mahav",
  "Fenzza",
  "Febella",
  "Face Beautiful",
  "Vivai",
  "Kyrav",
  "Miss France",
  "Lady Beauty",
  "4Angels",
];

function Brands() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="brandsSection reveal">
      <span className="sectionEyebrow">✨ Marcas parceiras</span>

      <div className="sectionTitle">
        <div>
          <h2>Trabalhamos com marcas reconhecidas no mercado</h2>
          <p>
            Produtos selecionados de marcas parceiras para lojas, profissionais e revendedoras.
          </p>
        </div>
      </div>

      <div className="brandsCarousel">
        <div className="brandsTrack">
          {[...brands, ...brands].map((brand, index) => (
            <div className="brandCard" key={`${brand}-${index}`}>
              <span>Parceira</span>
              <strong>{brand}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Brands;
