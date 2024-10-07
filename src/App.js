import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';
import { annotations } from './anotations';

const App = () => {
  const viewer = useRef(null);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: false,
      },
      viewer.current
    ).then((instance) => {
      instance.UI.loadDocument('/files/pdf-original.pdf', {});

      const { documentViewer, annotationManager } = instance.Core;

      const loadAnnotations = async () => {
        // normal xfdf
        // can only combine normal xfdf together
        // cannot combine command xfdf together
        const regularAnnotationParser = new DOMParser();
        const regularXfdfFormat =
          '<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><fields /><annots></annots></xfdf>';
        const regularData = regularAnnotationParser.parseFromString(
          regularXfdfFormat,
          'text/xml'
        );
        const xfdfAnnotations = regularData.querySelector('annots');

        annotations.forEach((annotation) => {
          const annotXFDFParser = new DOMParser();
          const annots = annotXFDFParser
            .parseFromString(annotation.xfdf, 'text/xml')
            .querySelector('annots').childNodes;
          annots.forEach((annot) => {
            // console.log('🚀 ~ annots.forEach ~ annot:', annot);
            xfdfAnnotations.appendChild(annot);
          });
        });
        const serializer = new XMLSerializer();
        const updatedXFDF = serializer.serializeToString(regularData);
        annotationManager.importAnnotations(updatedXFDF);
      };

      documentViewer.addEventListener('documentLoaded', async () => {
        instance.UI.openElements(['notesPanel']);
        loadAnnotations();
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
