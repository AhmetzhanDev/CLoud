const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('./data/research-assistant.db');

const articleId = uuidv4();
const now = new Date().toISOString();

const article = {
  id: articleId,
  title: 'Machine Learning Fundamentals: A Comprehensive Study',
  authors: JSON.stringify(['Dr. Jane Smith', 'Prof. John Doe']),
  abstract: 'This paper provides a comprehensive overview of machine learning fundamentals, including supervised and unsupervised learning techniques, neural networks, and their applications in modern AI systems.',
  content: `Introduction

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. This field has revolutionized numerous industries and continues to drive innovation in technology.

Background

The concept of machine learning dates back to the 1950s when Arthur Samuel developed the first self-learning program. Since then, the field has evolved dramatically with the advent of deep learning and neural networks.

Methodology

Our research employed several machine learning algorithms:

1. Supervised Learning: We used decision trees, random forests, and support vector machines to classify data.
2. Neural Networks: Deep learning models with multiple hidden layers were trained on large datasets.
3. Unsupervised Learning: Clustering algorithms like K-means were applied to discover patterns.

The dataset consisted of 10,000 samples with 50 features each, split into 70% training and 30% testing sets.

Results

Our experiments yielded the following results:
- Neural networks achieved 95% accuracy on the test set
- Random forests achieved 88% accuracy
- Decision trees reached 82% accuracy
- Support vector machines achieved 90% accuracy

The neural network model demonstrated superior performance but required significantly more computational resources and training time.

Discussion

The results indicate that deep learning approaches, while computationally expensive, provide the best accuracy for complex classification tasks. However, simpler models like random forests offer a good balance between performance and computational efficiency.

Conclusion

This study demonstrates that neural networks are highly effective for machine learning tasks, achieving 95% accuracy. Future work will explore ensemble methods and transfer learning to further improve performance while reducing computational costs.

References

1. Samuel, A. (1959). Some Studies in Machine Learning Using the Game of Checkers.
2. LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature.
3. Breiman, L. (2001). Random Forests. Machine Learning.`,
  source: 'upload',
  sourceId: null,
  filePath: null,
  url: null,
  publicationDate: '2023-01-15',
  keywords: JSON.stringify(['machine learning', 'neural networks', 'artificial intelligence', 'deep learning']),
  createdAt: now,
  updatedAt: now,
};

const stmt = db.prepare(`
  INSERT INTO articles (
    id, title, authors, abstract, content, source, source_id,
    file_path, url, publication_date, keywords, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

stmt.run(
  article.id,
  article.title,
  article.authors,
  article.abstract,
  article.content,
  article.source,
  article.sourceId,
  article.filePath,
  article.url,
  article.publicationDate,
  article.keywords,
  article.createdAt,
  article.updatedAt
);

console.log('✓ Test article created successfully!');
console.log('Article ID:', articleId);

db.close();
