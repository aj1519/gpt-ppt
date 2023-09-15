import React from 'react';
import axios from 'axios';

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const convertUrlToHtml = async (docxUrl) => {
    try {
      const response = await axios.get(docxUrl, { responseType: 'arraybuffer' });
      const arrayBuffer = response.data;
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error converting to HTML:', error);
      return null;
    }
  };

  const handleInput = async (message) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/gpt?text_input=${message}`);
      console.log(response.data['output_gpt']);

      const docxUrl = response.data['document']; // Assuming this is the URL of the Word document @abhishek pls check this
      const htmlUrl = await convertUrlToHtml(docxUrl);

      const botMessage = createChatBotMessage(response.data['output_gpt']['DesignDoc']['Intent'], {
        widget: 'umlRenderer',
        payload: { "diagram": response.data['diagram'], "document": htmlUrl }
      });

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      console.error('Error handling input:', error);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleInput
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
