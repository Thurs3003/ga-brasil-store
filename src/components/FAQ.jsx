import { useState } from "react";
import { ORDER_MINIMUM } from "../lib/orderConfig";

const FAQS = [
  {
    q: "Qual o pedido mínimo para compras no atacado?",
    a: `O pedido mínimo para compra é de R$ ${ORDER_MINIMUM.toFixed(2).replace(".", ",")}. Acima desse valor, você pode comprar a quantidade que precisar — e quanto maior o volume, melhores as condições de frete e preço. Entre em contato pelo WhatsApp para saber mais sobre descontos por volume.`,
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Aceitamos PIX (com desconto), transferência bancária e boleto bancário. Todas as condições são confirmadas pelo WhatsApp no momento da finalização do pedido.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "O prazo varia de acordo com a sua localização. Para São Paulo capital e Grande SP o prazo é de 1 a 2 dias úteis. Para outros estados, de 2 a 14 dias úteis dependendo da região. O frete pode ser calculado diretamente no carrinho.",
  },
  {
    q: "Como me tornar revendedor(a) G.A Brasil?",
    a: "É simples! Basta entrar em contato pelo nosso WhatsApp e nos contar um pouco sobre você. Não é necessário ter CNPJ — atendemos tanto pessoas físicas quanto jurídicas que queiram revender nossos produtos.",
  },
  {
    q: "Os produtos têm nota fiscal?",
    a: "Sim, todos os nossos produtos são emitidos com nota fiscal. Para pessoas jurídicas enviamos a NF-e diretamente para o e-mail cadastrado.",
  },
  {
    q: "Como acompanho meu pedido após a compra?",
    a: "Após confirmar o pagamento, você recebe o código de rastreamento pelo WhatsApp. Se você criou uma conta no site, também pode acompanhar o status diretamente na página 'Meus Pedidos'.",
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="faqSection" id="faq">
      <div className="sectionTitle">
        <h2>Perguntas frequentes</h2>
        <span>Dúvidas comuns sobre compra e revenda</span>
      </div>

      <div className="faqList">
        {FAQS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className={`faqItem ${isOpen ? "open" : ""}`}>
              <button className="faqQuestion" onClick={() => setOpenIdx(isOpen ? null : idx)}>
                <span>{item.q}</span>
                <span className="faqChevron">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <p className="faqAnswer">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;
