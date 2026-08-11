/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Car, Language } from '../types';

export const sendMessageToGemini = async (
  history: { role: string; text: string }[],
  newMessage: string,
  cars: Car[] = [],
  language: Language = 'ar'
): Promise<string> => {
  try {
    const carsContextSummary = cars.map(c => 
      `- ${c.brand} ${c.model} (${c.year}): Location: ${c.location === 'algeria' ? 'In Algeria' : 'In China (Ship time: ' + (c.shippingTime || '30-45 days') + ')'}, Price: ${c.priceDzd > 0 ? c.priceDzd + ' DZD' : 'On Request'}, Fuel: ${c.fuelType}, Specs: ${c.specs.slice(0, 3).join(', ')}, Phone: ${c.phone}`
    ).join('\n');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        message: newMessage,
        carsContext: carsContextSummary,
        language
      }),
    });

    if (!response.ok) {
      throw new Error(`Server response error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "مرحباً بك في KADEX DZ. يسعدنا الإجابة عن استفساراتك وتوجيهك بالهاتف أو الواتساب.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "مرحباً بك في معرض كADEX DZ! لتواصل أسرع وبمعلومات فورية، يسعدنا استقبال اتصالاتكم أو رسائلكم عبر الواتساب على الرقم: +213 550 12 34 56.";
  }
};
