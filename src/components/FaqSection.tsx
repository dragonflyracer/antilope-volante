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
      "Moins que vous le pensez. Une conception réfléchie dès le départ permet souvent d'obtenir un site distinctif sans faire exploser le budget.",
  },
  {
    question: "Pourquoi confier votre projet à l'Antilope Volante ?",
    answer:
      "Parce que je développe et conçois des expériences numériques depuis plus de 15 ans. J'ai imaginé et réalisé des projets variés, du jeu vidéo aux expériences interactives, avec un même objectif : créer quelque chose qui marque les esprits.",
  },
  {
    question: "Et si je ne sais pas exactement ce que je veux ?",
    answer:
      "C'est normal. Mon rôle est justement de vous aider à clarifier votre idée, puis de vous proposer une approche adaptée à vos objectifs et à votre budget.",
  },
  {
    question: "Combien de temps faut-il ?",
    answer:
      "Chaque projet est différent, mais je privilégie toujours une approche efficace : avancer rapidement sans sacrifier la qualité.",
  },
];

export function FaqSection() {
  return (
    <section className="faq-section">
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