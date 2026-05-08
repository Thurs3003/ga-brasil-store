import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "Distribuidora de Maquiagens",
    title: "Produtos de beleza para quem compra e revende",
    description:
      "Encontre maquiagens, acessórios e kits promocionais com preços especiais para lojistas e revendedoras.",
    button: "Ver produtos",
    link: "#produtos",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Semana da Beleza",
    title: "Kits promocionais com condições especiais",
    description:
      "Monte pedidos maiores com descontos em produtos selecionados e atendimento personalizado pelo WhatsApp.",
    button: "Ver promoções",
    link: "#promocoes",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Atacado e Revenda",
    title: "Compre para revender com mais variedade",
    description:
      "Produtos selecionados para lojas, salões, profissionais da beleza e revendedoras.",
    button: "Conhecer catálogo",
    link: "#produtos",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
  },
];

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  function goToSlide(index) {
    setCurrentSlide(index);
  }

  function nextSlide() {
    setCurrentSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1,
    );
  }

  function previousSlide() {
    setCurrentSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section id="inicio" className="heroCarousel">
      <div className="heroCarouselContent">
        <div className="heroCarouselText">
          <span>{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>

          <div className="heroButtons">
            <a href={slide.link}>{slide.button}</a>
            <a className="outline" href="#contato">
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div
          className="heroCarouselImage"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="heroCarouselBadge">
            <small>até</small>
            <strong>30%</strong>
            <span>OFF</span>
          </div>
        </div>
      </div>

      <button className="carouselArrow left" onClick={previousSlide}>
        ‹
      </button>

      <button className="carouselArrow right" onClick={nextSlide}>
        ›
      </button>

      <div className="carouselDots">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir para slide ${index + 1}`}
            className={`carouselDot ${currentSlide === index ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
