import {
  textTypes,
  gradientOptions,
} from "@lessonbuilder/constants/textTypesConfig";
import { imageTemplates } from "@lessonbuilder/constants/imageTemplates";
import { contentBlockTypes } from "@lessonbuilder/constants/blockTypes";
import openAIService from "./openAIService";
import { uploadAIGeneratedImage } from "./aiUploadService";

/**
 * Content Library AI Service - Uses ALL content library variants
 * Ensures every lesson uses each content type at least once
 */
class ContentLibraryAIService {
  constructor() {
    this.usedVariants = new Set();
  }

  /**
   * Get section focus based on lesson structure
   */
  getSectionFocus(sectionNumber, lessonTitle) {
    const focuses = [
      "Introduction and Overview",
      "Core Concepts and Definitions",
      "Key Principles and Theory",
      "Practical Applications",
      "Advanced Techniques",
      "Real-World Examples",
      "Best Practices and Tips",
      "Common Challenges and Solutions",
      "Summary and Review",
      "Next Steps and Resources",
    ];
    return focuses[sectionNumber - 1] || "Additional Topics";
  }

  /**
   * Generate enhanced lesson content with interactive templates
   * Uses 12-15 blocks with mix of text, interactive (tabs, accordion, timeline), and dividers
   */
  async generateSimpleLessonContent(
    lessonTitle,
    moduleTitle,
    courseTitle,
    onProgress,
  ) {
    console.log(
      "🎯 Generating enhanced lesson: Mix of headings, descriptions, interactive templates (12-15 blocks)",
    );

    const blocks = [];
    let order = 0;

    try {
      // Add Introduction Section (Blocks 1-2)
      const randomGradient =
        gradientOptions[Math.floor(Math.random() * gradientOptions.length)];
      blocks.push({
        id: `intro-heading-${Date.now()}`,
        type: "text",
        textType: "master_heading",
        content: lessonTitle,
        gradient: randomGradient.id,
        html_css: `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 24px 0; color: white; background: ${randomGradient.gradient}; padding: 20px; border-radius: 8px; text-align: center;">${lessonTitle}</h1>`,
        order: order++,
        metadata: {
          variant: "master_heading",
          section: "introduction",
        },
      });

      if (onProgress) {
        onProgress({
          blockType: "Master Heading",
          content: lessonTitle,
          totalSections: "12-15",
        });
      }

      // Introduction paragraph
      const introPrompt = `Write a compelling 2-3 sentence introduction for a lesson about "${lessonTitle}" in the course "${courseTitle}". Include what students will learn and why it matters.`;
      const introContent = await this.generateAIContent(introPrompt, 100);
      blocks.push({
        id: `intro-para-${Date.now()}`,
        type: "text",
        textType: "paragraph",
        content: introContent,
        order: order++,
        metadata: { variant: "introduction", section: "introduction" },
      });

      if (onProgress) {
        onProgress({
          blockType: "Introduction",
          content: introContent.substring(0, 50) + "...",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Section 1: Key Concepts with TABS (Block 3)
      blocks.push(
        await this.generateInteractiveTabsBlock(
          lessonTitle,
          order++,
          onProgress,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Section 2: Detailed Breakdown with ACCORDION (Block 4)
      blocks.push(
        await this.generateInteractiveAccordionBlock(
          lessonTitle,
          order++,
          onProgress,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Section 3: Process/Steps with PROCESS template (Block 5)
      blocks.push(
        await this.generateInteractiveProcessBlock(
          lessonTitle,
          order++,
          onProgress,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Section 4: Timeline (if applicable) (Block 6)
      blocks.push(
        await this.generateInteractiveTimelineBlock(
          lessonTitle,
          order++,
          onProgress,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Section 5: Supporting Content with regular text blocks (Blocks 7-8)
      const supportPrompt = `Write 2-3 key points about ${lessonTitle} that supplement the previous sections. Each point should be 1-2 sentences.`;
      const supportContent = await this.generateAIContent(supportPrompt, 150);
      blocks.push({
        id: `support-para-${Date.now()}`,
        type: "text",
        textType: "paragraph",
        content: supportContent,
        order: order++,
        metadata: { variant: "supporting_content" },
      });

      if (onProgress) {
        onProgress({
          blockType: "Supporting Content",
          content: supportContent.substring(0, 50) + "...",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Add one more statement for emphasis (Block 9)
      const statementContent = await this.generateAIContent(
        `Create one important key takeaway or insight about ${lessonTitle}`,
        80,
      );
      blocks.push({
        id: `statement-key-${Date.now()}`,
        type: "statement",
        statementType: "statement-b",
        content: statementContent,
        order: order++,
        metadata: { variant: "key_takeaway" },
      });

      if (onProgress) {
        onProgress({
          blockType: "Key Takeaway",
          content: statementContent,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Add practice tips with list (Block 10)
      const listItems = [
        "Practice with real-world examples",
        "Review the key concepts regularly",
        "Test your understanding with quizzes",
        "Share learning with peers",
      ];
      blocks.push({
        id: `tips-list-${Date.now()}`,
        type: "list",
        listType: "bulleted",
        items: listItems,
        order: order++,
        metadata: {
          variant: "practice_tips",
          title: "Practice Tips",
        },
      });

      if (onProgress) {
        onProgress({
          blockType: "Practice Tips List",
          content: "Tips for mastering this lesson",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Add divider (Block 11)
      blocks.push({
        id: `divider-middle-${Date.now()}`,
        type: "divider",
        subtype: "simple",
        content: "",
        order: order++,
        metadata: { variant: "divider" },
      });

      // Add assessment prompt (Block 12)
      const assessmentPrompt = `Create a summary question to assess understanding of ${lessonTitle}. Make it thought-provoking and relevant.`;
      const assessmentContent = await this.generateAIContent(
        assessmentPrompt,
        100,
      );
      blocks.push({
        id: `assessment-${Date.now()}`,
        type: "text",
        textType: "heading_paragraph",
        content: `<h3>Self-Assessment Question</h3><p>${assessmentContent}</p>`,
        order: order++,
        metadata: { variant: "self_assessment" },
      });

      if (onProgress) {
        onProgress({
          blockType: "Self-Assessment",
          content: assessmentContent.substring(0, 50) + "...",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Final completion divider
      blocks.push({
        id: `divider-complete-${Date.now()}`,
        type: "divider",
        subtype: "continue",
        content: "LESSON COMPLETE",
        html_css: `<div style="width: 100%; padding: 24px 0;">
        <div style="background-color: #10b981; color: white; text-align: center; padding: 16px 32px; font-weight: 600; font-size: 18px; letter-spacing: 0.1em;">
          ✓ LESSON COMPLETE
        </div>
      </div>`,
        order: order++,
        metadata: {
          variant: "completion",
          type: "completion",
        },
      });

      console.log(
        `✅ Generated ${blocks.length} enhanced content blocks with interactive templates`,
      );
      return blocks;
    } catch (error) {
      console.error("❌ Error generating enhanced content:", error);
      return this.generateFallbackContent(lessonTitle);
    }
  }

  /**
   * Generate interactive TABS block with HTML/CSS rendering
   */
  async generateInteractiveTabsBlock(lessonTitle, order, onProgress) {
    const tabTitles = ["Concept 1", "Concept 2", "Concept 3"];

    const tabsData = [];
    for (const title of tabTitles) {
      const content = await this.generateAIContent(
        `Explain "${title}" in the context of ${lessonTitle} in 2-3 sentences.`,
        100,
      );
      tabsData.push({
        title,
        content,
        image: null,
        audio: null,
      });
    }

    if (onProgress) {
      onProgress({
        blockType: "Interactive Tabs",
        content: `Compare: ${tabTitles.join(", ")}`,
      });
    }

    // Generate HTML/CSS for tabs display
    const htmlCss = this.generateTabsHTML(tabsData);

    return {
      id: `tabs-${Date.now()}`,
      type: "interactive",
      interactiveType: "tabs",
      content: JSON.stringify(tabsData),
      html_css: htmlCss,
      order,
      isAIGenerated: true,
      metadata: {
        variant: "tabs",
        tabCount: 3,
      },
    };
  }

  /**
   * Generate interactive ACCORDION block with HTML/CSS rendering
   */
  async generateInteractiveAccordionBlock(lessonTitle, order, onProgress) {
    const sectionTitles = ["Overview", "Deep Dive", "Best Practices"];

    const accordionData = [];
    for (const title of sectionTitles) {
      const content = await this.generateAIContent(
        `Write detailed content for "${title}" section about ${lessonTitle}. 3-4 sentences with practical information.`,
        120,
      );
      accordionData.push({
        title,
        content,
        image: null,
        audio: null,
      });
    }

    if (onProgress) {
      onProgress({
        blockType: "Interactive Accordion",
        content: "Expandable sections with detailed information",
      });
    }

    // Generate HTML/CSS for accordion display
    const htmlCss = this.generateAccordionHTML(accordionData);

    return {
      id: `accordion-${Date.now()}`,
      type: "interactive",
      interactiveType: "accordion",
      content: JSON.stringify(accordionData),
      html_css: htmlCss,
      order,
      isAIGenerated: true,
      metadata: {
        variant: "accordion",
        sectionCount: 3,
      },
    };
  }

  /**
   * Generate interactive PROCESS block with HTML/CSS rendering
   */
  async generateInteractiveProcessBlock(lessonTitle, order, onProgress) {
    const steps = ["Preparation", "Implementation", "Evaluation"];

    const processData = [];
    for (let i = 0; i < steps.length; i++) {
      const description = await this.generateAIContent(
        `Describe the "${steps[i]}" step for ${lessonTitle}. What should be done? Why is it important?`,
        100,
      );
      processData.push({
        step: i + 1,
        title: steps[i],
        description,
        image: null,
      });
    }

    if (onProgress) {
      onProgress({
        blockType: "Interactive Process",
        content: `${steps.length}-step process for ${lessonTitle}`,
      });
    }

    // Generate HTML/CSS for process display
    const htmlCss = this.generateProcessHTML(processData);

    return {
      id: `process-${Date.now()}`,
      type: "interactive",
      interactiveType: "process",
      content: JSON.stringify(processData),
      html_css: htmlCss,
      order,
      isAIGenerated: true,
      metadata: {
        variant: "process",
        stepCount: steps.length,
      },
    };
  }

  /**
   * Generate interactive TIMELINE block with HTML/CSS rendering
   */
  async generateInteractiveTimelineBlock(lessonTitle, order, onProgress) {
    const phases = ["Foundation", "Development", "Mastery"];

    const timelineData = [];
    for (let i = 0; i < phases.length; i++) {
      const description = await this.generateAIContent(
        `Describe the "${phases[i]}" phase in learning ${lessonTitle}. What are the key milestones?`,
        100,
      );
      timelineData.push({
        id: String(i + 1),
        date: `Phase ${i + 1}`,
        title: phases[i],
        description,
        image: null,
      });
    }

    if (onProgress) {
      onProgress({
        blockType: "Interactive Timeline",
        content: `Learning journey: ${phases.join(" → ")}`,
      });
    }

    // Generate HTML/CSS for timeline display
    const htmlCss = this.generateTimelineHTML(timelineData);

    return {
      id: `timeline-${Date.now()}`,
      type: "interactive",
      interactiveType: "timeline",
      content: JSON.stringify(timelineData),
      html_css: htmlCss,
      order,
      isAIGenerated: true,
      metadata: {
        variant: "timeline",
        phaseCount: phases.length,
      },
    };
  }

  /**
   * Generate HTML/CSS for TABS template
   */
  generateTabsHTML(tabsData) {
    const containerId = `tabs-${Date.now()}`;
    const buttons = tabsData
      .map(
        (tab, index) =>
          `<button class="tab-button px-4 py-3 font-medium text-gray-700 border-b-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors" onclick="switchTab('${containerId}', ${index})">${tab.title}</button>`,
      )
      .join("");

    const panels = tabsData
      .map(
        (tab, index) =>
          `<div class="tab-panel ${index === 0 ? "" : "hidden"} p-6">
        <div class="text-gray-700 leading-relaxed">${tab.content}</div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg shadow-md p-4" id="${containerId}">
      <div class="flex border-b border-gray-200 mb-6">
        ${buttons}
      </div>
      <div class="tab-content">
        ${panels}
      </div>
    </div>`;
  }

  /**
   * Generate HTML/CSS for ACCORDION template
   */
  generateAccordionHTML(accordionData) {
    const containerId = `accordion-${Date.now()}`;
    const items = accordionData
      .map(
        (section, index) =>
          `<div class="border-b border-gray-200 last:border-b-0">
        <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors" onclick="toggleAccordion('${containerId}', ${index})">
          <span class="font-semibold text-gray-900">${section.title}</span>
          <svg class="w-5 h-5 text-gray-500 transition-transform" data-icon="${index}" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="accordion-content max-h-0 overflow-hidden transition-all duration-300" data-content="${index}">
          <div class="px-6 py-4 text-gray-700 leading-relaxed bg-gray-50">
            ${section.content}
          </div>
        </div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg shadow-md overflow-hidden" id="${containerId}">
      ${items}
    </div>`;
  }

  /**
   * Generate HTML/CSS for PROCESS template
   */
  generateProcessHTML(processData) {
    const items = processData
      .map(
        (step, index) =>
          `<div class="flex gap-6 mb-6 relative">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">${step.step}</div>
          ${index < processData.length - 1 ? '<div class="w-1 h-16 bg-blue-200 mt-2"></div>' : ""}
        </div>
        <div class="flex-1 pt-2">
          <h3 class="font-semibold text-lg text-gray-900 mb-2">${step.title}</h3>
          <p class="text-gray-700 leading-relaxed">${step.description}</p>
        </div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg shadow-md p-8">
      <div class="space-y-4">
        ${items}
      </div>
    </div>`;
  }

  /**
   * Generate HTML/CSS for TIMELINE template
   */
  generateTimelineHTML(timelineData) {
    const items = timelineData
      .map(
        (phase, index) =>
          `<div class="flex gap-6 mb-8 relative">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">${phase.id}</div>
          ${index < timelineData.length - 1 ? '<div class="w-0.5 h-20 bg-green-200 mt-2"></div>' : ""}
        </div>
        <div class="flex-1 pt-1">
          <h4 class="font-semibold text-gray-900">${phase.title}</h4>
          <p class="text-sm text-gray-500 mb-2">${phase.date}</p>
          <p class="text-gray-700 leading-relaxed">${phase.description}</p>
        </div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg shadow-md p-8">
      <div class="space-y-2">
        ${items}
      </div>
    </div>`;
  }

  /**
   * Generate comprehensive lesson using ALL content library variants
   */
  async generateComprehensiveLessonContent(
    lessonTitle,
    moduleTitle,
    courseTitle,
  ) {
    console.log("🎯 Generating lesson with ALL content library variants");

    const blocks = [];
    let order = 0;

    try {
      // 1. TEXT VARIANTS - Use all 6 types
      blocks.push(...(await this.generateAllTextVariants(lessonTitle, order)));
      order += 6;

      // 2. IMAGE VARIANTS - Use all 5 templates
      blocks.push(...(await this.generateAllImageVariants(lessonTitle, order)));
      order += 5;

      // 3. STATEMENT VARIANTS - Use all 5 types
      blocks.push(
        ...(await this.generateAllStatementVariants(lessonTitle, order)),
      );
      order += 5;

      // 4. LIST VARIANTS - Use multiple numbering and bullet styles
      blocks.push(...(await this.generateAllListVariants(lessonTitle, order)));
      order += 11; // 5 numbering + 6 bullet styles

      // 5. QUOTE VARIANTS - Use quote templates
      blocks.push(...(await this.generateQuoteVariants(lessonTitle, order)));
      order += 3;

      // 6. OTHER CONTENT TYPES
      blocks.push(
        ...(await this.generateOtherContentTypes(lessonTitle, order)),
      );

      console.log(
        `✅ Generated ${blocks.length} blocks using ALL content library variants`,
      );
      return blocks;
    } catch (error) {
      console.error("❌ Error generating comprehensive content:", error);
      return this.generateFallbackContent(lessonTitle);
    }
  }

  /**
   * Generate all 6 text variants
   */
  async generateAllTextVariants(lessonTitle, startOrder) {
    const blocks = [];

    // 1. Master Heading with random gradient
    const randomGradient =
      gradientOptions[Math.floor(Math.random() * gradientOptions.length)];
    blocks.push({
      id: `text-master-${Date.now()}`,
      type: "text",
      textType: "master_heading",
      content: lessonTitle,
      gradient: randomGradient.id,
      order: startOrder,
      metadata: { variant: "master_heading", gradient: randomGradient.name },
    });

    // 2. Standard Heading
    blocks.push({
      id: `text-heading-${Date.now()}`,
      type: "text",
      textType: "heading",
      content: "Key Concepts",
      order: startOrder + 1,
      metadata: { variant: "heading" },
    });

    // 3. Subheading
    blocks.push({
      id: `text-subheading-${Date.now()}`,
      type: "text",
      textType: "subheading",
      content: "Learning Objectives",
      order: startOrder + 2,
      metadata: { variant: "subheading" },
    });

    // 4. Paragraph
    const paragraphContent = await this.generateAIContent(
      `Write a comprehensive paragraph about ${lessonTitle}`,
      150,
    );
    blocks.push({
      id: `text-paragraph-${Date.now()}`,
      type: "text",
      textType: "paragraph",
      content: paragraphContent,
      order: startOrder + 3,
      metadata: { variant: "paragraph" },
    });

    // 5. Heading + Paragraph
    const headingParagraphContent = await this.generateAIContent(
      `Write content for ${lessonTitle} with heading and explanation`,
      200,
    );
    blocks.push({
      id: `text-heading-para-${Date.now()}`,
      type: "text",
      textType: "heading_paragraph",
      content: `<h2>Understanding ${lessonTitle}</h2><p>${headingParagraphContent}</p>`,
      order: startOrder + 4,
      metadata: { variant: "heading_paragraph" },
    });

    // 6. Subheading + Paragraph
    const subheadingParagraphContent = await this.generateAIContent(
      `Write detailed explanation about ${lessonTitle}`,
      180,
    );
    blocks.push({
      id: `text-subheading-para-${Date.now()}`,
      type: "text",
      textType: "subheading_paragraph",
      content: `<h3>Practical Applications</h3><p>${subheadingParagraphContent}</p>`,
      order: startOrder + 5,
      metadata: { variant: "subheading_paragraph" },
    });

    return blocks;
  }

  /**
   * Generate all 5 image variants
   */
  async generateAllImageVariants(lessonTitle, startOrder) {
    const blocks = [];

    for (let i = 0; i < imageTemplates.length; i++) {
      const template = imageTemplates[i];
      let imageUrl = "";
      let textContent = "";

      if (template.id === "ai-generated") {
        // Generate AI image and upload to S3
        try {
          const prompt = `Create an educational illustration for ${lessonTitle}`;
          console.log(`🎨 Generating AI image: ${prompt}`);
          const imageResult = await openAIService.generateImage(prompt);
          const tempImageUrl = imageResult.url || imageResult.imageUrl;

          if (tempImageUrl) {
            console.log(`✅ AI image generated: ${tempImageUrl}`);

            // Upload to S3 using the same logic as course thumbnails
            try {
              console.log("📤 Uploading AI image to S3...");
              const uploadResult = await uploadAIGeneratedImage(tempImageUrl, {
                public: true,
                folder: "ai-lesson-images",
              });

              if (uploadResult.success && uploadResult.imageUrl) {
                imageUrl = uploadResult.imageUrl;
                console.log(`✅ AI image uploaded to S3: ${imageUrl}`);
              } else {
                imageUrl = tempImageUrl; // Fallback to original URL
                console.warn("⚠️ S3 upload failed, using temporary URL");
              }
            } catch (uploadError) {
              imageUrl = tempImageUrl; // Fallback to original URL
              console.error("❌ S3 upload error:", uploadError);
            }
          } else {
            throw new Error("No image URL returned from AI service");
          }
        } catch (error) {
          console.error("❌ AI image generation failed:", error);
          imageUrl =
            "https://via.placeholder.com/800x400?text=AI+Generated+Image";
        }
        textContent = `AI generated illustration for ${lessonTitle}`;
      } else {
        imageUrl = template.defaultContent.imageUrl;
        textContent = template.defaultContent.text;
      }

      blocks.push({
        id: `image-${template.id}-${Date.now()}`,
        type: "image",
        template: template.id,
        layout: template.layout,
        content: {
          imageUrl: imageUrl,
          text: textContent,
          caption: `${template.title} example for ${lessonTitle}`,
        },
        order: startOrder + i,
        metadata: { variant: template.id, layout: template.layout },
      });
    }

    return blocks;
  }

  /**
   * Generate all 5 statement variants
   */
  async generateAllStatementVariants(lessonTitle, startOrder) {
    const blocks = [];
    const statementTypes = [
      "statement-a",
      "statement-b",
      "statement-c",
      "statement-d",
      "note",
    ];

    for (let i = 0; i < statementTypes.length; i++) {
      const statementType = statementTypes[i];
      const content = await this.generateAIContent(
        `Create an important statement or key insight about ${lessonTitle}`,
        100,
      );

      blocks.push({
        id: `statement-${statementType}-${Date.now()}`,
        type: "statement",
        statementType: statementType,
        content: content,
        order: startOrder + i,
        metadata: { variant: statementType },
      });
    }

    return blocks;
  }

  /**
   * Generate all list variants (5 numbering + 6 bullet styles)
   */
  async generateAllListVariants(lessonTitle, startOrder) {
    const blocks = [];
    let currentOrder = startOrder;

    // Numbering styles
    const numberingStyles = [
      "decimal",
      "upper-roman",
      "lower-roman",
      "upper-alpha",
      "lower-alpha",
    ];
    for (let i = 0; i < numberingStyles.length; i++) {
      const items = await this.generateListItems(lessonTitle, "numbered");
      blocks.push({
        id: `list-numbered-${numberingStyles[i]}-${Date.now()}`,
        type: "list",
        listType: "numbered",
        numberingStyle: numberingStyles[i],
        items: items,
        order: currentOrder++,
        metadata: { variant: `numbered-${numberingStyles[i]}` },
      });
    }

    // Bullet styles
    const bulletStyles = [
      "circle",
      "square",
      "disc",
      "arrow",
      "star",
      "diamond",
    ];
    for (let i = 0; i < bulletStyles.length; i++) {
      const items = await this.generateListItems(lessonTitle, "bulleted");
      blocks.push({
        id: `list-bulleted-${bulletStyles[i]}-${Date.now()}`,
        type: "list",
        listType: "bulleted",
        bulletStyle: bulletStyles[i],
        items: items,
        order: currentOrder++,
        metadata: { variant: `bulleted-${bulletStyles[i]}` },
      });
    }

    return blocks;
  }

  /**
   * Generate quote variants
   */
  async generateQuoteVariants(lessonTitle, startOrder) {
    const blocks = [];

    // Simple quote
    const quoteContent = await this.generateAIContent(
      `Create an inspiring quote related to ${lessonTitle}`,
      80,
    );
    blocks.push({
      id: `quote-simple-${Date.now()}`,
      type: "quote",
      content: quoteContent,
      author: "Expert",
      order: startOrder,
      metadata: { variant: "simple-quote" },
    });

    // Quote with background
    blocks.push({
      id: `quote-background-${Date.now()}`,
      type: "quote",
      content: quoteContent,
      author: "Industry Leader",
      backgroundImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      order: startOrder + 1,
      metadata: { variant: "background-quote" },
    });

    // Enhanced Carousel quotes with 3 distinct perspectives
    const carouselQuotes =
      await this.generateEnhancedCarouselQuotes(lessonTitle);

    blocks.push({
      id: `quote-carousel-${Date.now()}`,
      type: "quote",
      textType: "quote_carousel",
      subtype: "quote_carousel",
      content: JSON.stringify({ quotes: carouselQuotes }),
      quotes: carouselQuotes,
      order: startOrder + 2,
      isAIGenerated: true,
      metadata: {
        variant: "carousel-quotes",
        quoteCount: carouselQuotes.length,
        source: "AI-generated carousel quotes",
      },
    });

    return blocks;
  }

  /**
   * Generate enhanced carousel quotes with 3 different perspectives
   */
  async generateEnhancedCarouselQuotes(lessonTitle) {
    const quotes = [];

    // Fallback quotes in case AI generation fails
    const fallbackQuotes = [
      {
        quote:
          "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
        author: "Brian Herbert",
      },
      {
        quote:
          "Success is not final, failure is not fatal. It is the courage to continue that counts.",
        author: "Winston Churchill",
      },
      {
        quote:
          "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
      },
    ];

    const perspectives = [
      {
        type: "inspirational",
        prompt: `Generate an inspirational quote about learning and mastery related to "${lessonTitle}". Format: "Quote" - Author Name`,
      },
      {
        type: "expert",
        prompt: `Generate an expert perspective quote about practical application of "${lessonTitle}". Format: "Quote" - Author Name`,
      },
      {
        type: "motivational",
        prompt: `Generate a motivational quote about the journey of learning "${lessonTitle}". Format: "Quote" - Author Name`,
      },
    ];

    for (let i = 0; i < perspectives.length; i++) {
      try {
        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        const content = await this.generateAIContent(
          perspectives[i].prompt,
          100,
        );
        const match = content.match(/"([^"]+)"\s*[-–—]\s*(.+)/);

        if (match) {
          quotes.push({
            quote: match[1].trim(),
            author: match[2].trim(),
          });
        } else if (content && content.length > 10) {
          // Fallback if parsing fails
          quotes.push({
            quote: content.substring(0, 100),
            author: "Expert",
          });
        }
      } catch (error) {
        console.warn(
          `Failed to generate ${perspectives[i].type} quote:`,
          error,
        );
        // Use fallback quote on error
        if (i < fallbackQuotes.length) {
          quotes.push(fallbackQuotes[i]);
        }
      }
    }

    // Return generated quotes or fallback quotes
    return quotes.length > 0 ? quotes : fallbackQuotes;
  }

  /**
   * Generate other content types
   */
  async generateOtherContentTypes(lessonTitle, startOrder) {
    const blocks = [];

    // Table
    blocks.push({
      id: `table-${Date.now()}`,
      type: "table",
      content: {
        headers: ["Concept", "Definition", "Example"],
        rows: [
          ["Key Point 1", "Explanation 1", "Example 1"],
          ["Key Point 2", "Explanation 2", "Example 2"],
          ["Key Point 3", "Explanation 3", "Example 3"],
        ],
      },
      order: startOrder,
      metadata: { variant: "data-table" },
    });

    // Checklist
    blocks.push({
      id: `checklist-${Date.now()}`,
      type: "checklist",
      items: [
        "Complete the reading assignment",
        "Practice the key concepts",
        "Review the examples",
        "Take the quiz",
      ],
      order: startOrder + 1,
      metadata: { variant: "task-checklist" },
    });

    // Link
    blocks.push({
      id: `link-${Date.now()}`,
      type: "link",
      content: {
        url: "https://example.com",
        title: `Additional Resources for ${lessonTitle}`,
        description: "Explore more about this topic",
      },
      order: startOrder + 2,
      metadata: { variant: "external-link" },
    });

    return blocks;
  }

  /**
   * Generate AI content using OpenAI
   */
  async generateAIContent(prompt, maxWords = 100) {
    try {
      console.log(`🤖 Generating AI content: ${prompt}`);
      const result = await openAIService.generateText(prompt, {
        maxTokens: maxWords * 2,
        temperature: 0.7,
      });

      // openAIService.generateText returns a string directly
      if (typeof result === "string" && result.trim()) {
        // Remove surrounding quotes if present
        let cleanedResult = result.trim();
        cleanedResult = cleanedResult.replace(/^["'](.+)["']$/, "$1");

        console.log(
          `✅ AI content generated: ${cleanedResult.substring(0, 50)}...`,
        );
        return cleanedResult;
      }

      console.warn("⚠️ AI content generation returned empty result");
      return `Generated content about ${prompt.toLowerCase()}`;
    } catch (error) {
      console.error("❌ AI content generation failed:", error);
      return `Content about ${prompt.toLowerCase()}`;
    }
  }

  /**
   * Generate list items
   */
  async generateListItems(lessonTitle, type) {
    const items = [];
    const prompts = [
      `Key benefit of ${lessonTitle}`,
      `Important aspect of ${lessonTitle}`,
      `Practical application of ${lessonTitle}`,
      `Essential concept in ${lessonTitle}`,
    ];

    for (const prompt of prompts) {
      const content = await this.generateAIContent(prompt, 20);
      items.push(content);
    }

    return items;
  }

  /**
   * Fallback content if AI generation fails
   */
  generateFallbackContent(lessonTitle) {
    return [
      {
        id: `fallback-${Date.now()}`,
        type: "text",
        textType: "master_heading",
        content: lessonTitle,
        gradient: "gradient1",
        order: 0,
      },
      {
        id: `fallback-content-${Date.now()}`,
        type: "text",
        textType: "paragraph",
        content: `This lesson covers the essential concepts of ${lessonTitle}.`,
        order: 1,
      },
    ];
  }

  /**
   * Generate HTML/CSS for TABS template with Tailwind styling
   */
  generateTabsHTML(tabsData) {
    const containerId = `tabs-${Date.now()}`;
    const buttons = tabsData
      .map(
        (tab, index) =>
          `<button class="tab-button px-4 py-3 font-medium text-gray-700 border-b-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200" onclick="switchTab('${containerId}', ${index})" style="flex: 1; text-align: center;">${tab.title}</button>`,
      )
      .join("");

    const panels = tabsData
      .map(
        (tab, index) =>
          `<div class="tab-panel ${index === 0 ? "block" : "hidden"} p-6" style="display: ${index === 0 ? "block" : "none"};">
        <div class="text-gray-700 leading-relaxed space-y-3">${tab.content}</div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg border border-gray-200 overflow-hidden" id="${containerId}">
      <div class="flex border-b border-gray-200" style="background: #f9fafb;">
        ${buttons}
      </div>
      <div class="tab-content">
        ${panels}
      </div>
    </div>`;
  }

  /**
   * Generate HTML/CSS for ACCORDION template with Tailwind styling
   */
  generateAccordionHTML(accordionData) {
    const containerId = `accordion-${Date.now()}`;
    const items = accordionData
      .map(
        (section, index) =>
          `<div class="border-b border-gray-200 last:border-b-0">
        <button class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200" onclick="toggleAccordion('${containerId}', ${index})" style="background: white;">
          <span class="font-semibold text-gray-900">${section.title}</span>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200" data-icon="${index}" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="accordion-content max-h-0 overflow-hidden transition-all duration-300" data-content="${index}" style="max-height: 0;">
          <div class="px-6 py-4 text-gray-700 leading-relaxed" style="background: #f9fafb;">
            ${section.content}
          </div>
        </div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg border border-gray-200 overflow-hidden" id="${containerId}">
      ${items}
    </div>`;
  }

  /**
   * Generate HTML/CSS for PROCESS template with Tailwind styling
   */
  generateProcessHTML(processData) {
    const items = processData
      .map(
        (step, index) =>
          `<div class="flex gap-6 mb-8 relative">
        <div class="flex flex-col items-center flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">${step.step}</div>
          ${index < processData.length - 1 ? '<div class="w-1 h-20 bg-blue-200 mt-2" style="background: rgba(59, 130, 246, 0.2);"></div>' : ""}
        </div>
        <div class="flex-1 pt-2">
          <h3 class="font-semibold text-lg text-gray-900 mb-2">${step.title}</h3>
          <p class="text-gray-700 leading-relaxed">${step.description}</p>
        </div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg border border-gray-200 p-8">
      <div class="space-y-4">
        ${items}
      </div>
    </div>`;
  }

  /**
   * Generate HTML/CSS for TIMELINE template with Tailwind styling
   */
  generateTimelineHTML(timelineData) {
    const items = timelineData
      .map(
        (phase, index) =>
          `<div class="flex gap-6 mb-8 relative">
        <div class="flex flex-col items-center flex-shrink-0">
          <div class="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">${phase.id}</div>
          ${index < timelineData.length - 1 ? '<div class="w-0.5 h-20 bg-green-200" style="background: rgba(16, 185, 129, 0.2);"></div>' : ""}
        </div>
        <div class="flex-1 pt-1">
          <h4 class="font-semibold text-gray-900">${phase.title}</h4>
          <p class="text-sm text-gray-500 mb-2">${phase.date}</p>
          <p class="text-gray-700 leading-relaxed">${phase.description}</p>
        </div>
      </div>`,
      )
      .join("");

    return `<div class="bg-white rounded-lg border border-gray-200 p-8">
      <div class="space-y-2">
        ${items}
      </div>
    </div>`;
  }
}

export default new ContentLibraryAIService();
