import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { subscribeToSettings } from "../lib/settings";

const DEFAULT_SLIDES = [
  {
    eyebrow: "Distribuidora de Maquiagens",
    title: "Produtos de beleza para quem compra e revende",
    description:
      "Encontre maquiagens, acessórios e kits promocionais com preços especiais para lojistas e revendedoras.",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    type: "split",
  },
  {
    eyebrow: "Semana da Beleza",
    title: "Kits promocionais com condições especiais",
    description:
      "Monte pedidos maiores com descontos em produtos selecionados e atendimento personalizado pelo WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
    type: "split",
  },
  {
    eyebrow: "Atacado e Revenda",
    title: "Compre para revender com mais variedade",
    description:
      "Produtos selecionados para lojas, salões, profissionais da beleza e revendedoras.",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
    type: "split",
  },
];

function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    // Leitura direta do Supabase — sem depender de cache compartilhado
    supabase
      .from("settings")
      .select("value")
      .eq("key", "hero_slides")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setSlides(data.value);
        }
      });

    // Recebe atualizações ao vivo quando o admin salva slides
    return subscribeToSettings((settings) => {
      if (Array.isArray(settings.hero_slides) && settings.hero_slides.length > 0) {
        setSlides(settings.hero_slides);
      }
    });
  }, []);

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

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchMove(event) {
    touchEndX.current = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      nextSlide();
    }

    if (distance < -50) {
      previousSlide();
    }
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const safeIndex = Math.min(currentSlide, slides.length - 1);
  const slide = slides[safeIndex] || slides[0];
  const slideType = slide.type || "split";

  function renderSlideContent() {
    const textContent = (
      <>
        {slide.eyebrow && (
          <span key={`eyebrow-${currentSlide}`} className="heroSlideIn" style={{ animationDelay: "0s" }}>
            {slide.eyebrow}
          </span>
        )}
        <h1 key={`title-${currentSlide}`} className="heroSlideIn" style={{ animationDelay: "0.08s" }}>{slide.title}</h1>
        <p key={`desc-${currentSlide}`} className="heroSlideIn" style={{ animationDelay: "0.16s" }}>{slide.description}</p>
        {slide.showButtons !== false && (
          <div key={`btns-${currentSlide}`} className="heroButtons heroSlideIn" style={{ animationDelay: "0.24s" }}>
            <a href="#produtos">Ver produtos</a>
            <a className="outline" href="#contato">Falar no WhatsApp</a>
          </div>
        )}
      </>
    );

    if (slideType === "text-only") {
      return (
        <div className="heroCarouselContent heroContentTextOnly">
          <div className="heroCarouselText heroTextFull">
            {textContent}
          </div>
        </div>
      );
    }

    if (slideType === "fullbg") {
      return (
        <div
          className="heroCarouselContent heroContentFullBg"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="heroCarouselText heroTextOnBg">
            {textContent}
          </div>
        </div>
      );
    }

    return (
      <div className="heroCarouselContent">
        <div className="heroCarouselText">
          {textContent}
        </div>
        <div
          key={`img-${currentSlide}`}
          className="heroCarouselImage heroImageReveal"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="heroCarouselBadge">
            <small>até</small>
            <strong>15%</strong>
            <span>OFF</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="inicio"
      className="heroCarousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderSlideContent()}

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
