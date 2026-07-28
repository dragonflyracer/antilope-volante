import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    question: "Un site web qui se démarque, c'est cher ?",
    answer:
      "Pas forcément. Un site coûte surtout cher lorsqu'il est mal pensé. Une conception réfléchie dès le départ permet souvent de créer une expérience mémorable tout en respectant votre budget.",
  },
  {
    question: "Pourquoi choisir L'Antilope volante ?",
    answer:
      "Parce que je ne crée pas seulement des sites web. Depuis plus de 15 ans, je conçois des expériences numériques qui captent l'attention et donnent envie d'aller plus loin. Chaque projet est imaginé pour raconter une histoire et atteindre un objectif concret.",
  },
  {
    question: "Pourquoi vos sites sont-ils plus faciles à utiliser ?",
    answer:
      "L'Antilope volante est née d'une idée simple : lorsqu'un chemin est bien pensé, on avance avec légèreté. C'est cette philosophie que j'applique à chaque projet. Je repère les points de friction, j'élimine les détours inutiles et je construis des interfaces qui donnent envie d'aller jusqu'au bout.",
  },
  {
    question: "À quoi ressemble la collaboration ?",
    answer:
      "Simple, transparente et humaine. Nous échangeons, nous validons les grandes étapes ensemble et vous voyez votre projet évoluer progressivement, sans mauvaise surprise.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-24">
      <div className="faq-container">

        <div className="faq-antelope-space" />

        <Accordion
          type="single"
          collapsible
          className="faq-accordion"
        >
          {questions.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className="faq-item"
            >
              <AccordionTrigger className="faq-trigger">
                {item.question}
              </AccordionTrigger>

              <AccordionContent className="faq-content">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}