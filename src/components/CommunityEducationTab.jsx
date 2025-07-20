import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const educationData = {
  glossary: [
    {
      term: 'Riba',
      definition:
        'Literally means "increase" or "growth." In Islamic finance, it refers to the interest charged on loans. There are two main types: Riba al-Fadl (excess in the exchange of commodities) and Riba al-Nasiah (interest on delayed payment). It is forbidden because it creates an unfair system where the wealthy can earn money without taking any risk, while those in need of funds are burdened with additional costs.',
    },
    {
      term: 'Gharar',
      definition:
        'Refers to excessive uncertainty, ambiguity, or risk in a contract. It involves the sale of items that are not yet in existence or whose characteristics are not fully known, making the transaction akin to gambling. Examples include selling fish that have not been caught or crops that have not been harvested. The prohibition of Gharar ensures transparency and fairness in all transactions.',
    },
    {
      term: 'Maysir',
      definition:
        'Means gambling or speculation. It is any game of chance where wealth is acquired through luck rather than productive effort. This is prohibited because it involves the unjust acquisition of wealth and can lead to social and economic instability.',
    },
  ],
  learningModules: [
    {
      title: 'How does Shariah screening work?',
      content:
        "Shariah screening is a meticulous process used to determine whether a company is a permissible investment according to Islamic law. It involves two primary levels of analysis: business activity screening and financial ratio screening. Business activity screening excludes companies involved in industries such as alcohol, gambling, pork, and conventional financial services. Financial ratio screening examines a company's financial health to ensure it meets specific criteria related to debt, interest-bearing securities, and non-compliant income, ensuring that the investment is both ethical and financially sound.",
    },
  ],
};

const CommunityEducationTab = () => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Community and Education</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Glossary of Key Terms</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4 pl-4">
                {educationData.glossary.map((item, index) => (
                  <li key={index}>
                    <span className="font-semibold">{item.term}:</span>{' '}
                    <p className="text-muted-foreground inline">
                      {item.definition}
                    </p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Learning Modules</AccordionTrigger>
            <AccordionContent>
              {educationData.learningModules.map((module, index) => (
                <div key={index} className="pl-4">
                  <h4 className="font-semibold">{module.title}</h4>
                  <p className="text-muted-foreground">{module.content}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Join the Discussion</AccordionTrigger>
            <AccordionContent>
              <div className="pl-4">
                <p className="text-muted-foreground">
                  Have a question or want to suggest a Shariah ruling? Join our
                  community forum to discuss with other users and experts.
                </p>
                <Button className="mt-2">Go to Forum</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CommunityEducationTab; 