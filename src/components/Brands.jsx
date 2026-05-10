const brands = ["Ruby Rose", "Belle Angel", "Macrilan", "Max Love"];

function Brands() {
  return (
    <section className="brandSection">
      <div className="sectionTItle">
        <div>
          <span className="sectionEyebrow">✨ Marcas parceiras</span>

          <h2>Trabalhamos com marcas que fazem sucesso no mercado</h2>

          <p>
            Produtos de marcas reconhecidas por lojistas, maquiadores e
            revendedores em todo o Brasil.
          </p>
        </div>
      </div>

      <div className="brandsGrid">
        {brands.map((brand) => (
          <div className="brandCard" key={brand}>
            <span>Parceira</span>
            <strong>{brand}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Brands;
