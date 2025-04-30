
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
        this.element = null;
        this.originalX = 0;
        this.originalY = 0;
        this.depth = 0;
    }
}

class TreeVisualizer {
    constructor() {
        this.root = null;
        this.treeContainer = document.getElementById('tree');
        this.traversalDisplay = document.getElementById('traversalDisplay');
        this.nodeValueInput = document.getElementById('nodeValue');
        this.addBtn = document.getElementById('addBtn');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.traversalSteps = [];
        this.currentStep = 0;
        this.animationInterval = null;
        this.nodeCount = 0;
        
        this.setupEventListeners();
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupEventListeners() {
        this.addBtn.addEventListener('click', () => this.addNode());
        this.startBtn.addEventListener('click', () => this.startTraversal());
        this.resetBtn.addEventListener('click', () => this.resetTree());
        this.nodeValueInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNode();
        });
    }
    
    handleResize() {
        if (this.root) {
            this.drawTree();
        }
    }
    
    addNode() {
        const value = this.nodeValueInput.value;
        if (!value) return;
        
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
            alert('Please enter a valid number');
            return;
        }
        
        const newNode = new TreeNode(numValue);
        
        if (!this.root) {
            this.root = newNode;
            this.nodeCount = 1;
        } else {
            this.insertNode(this.root, newNode);
        }
        
        this.drawTree();
        this.nodeValueInput.value = '';
        this.nodeValueInput.focus();
    }
    
    insertNode(root, newNode) {
        if (newNode.value < root.value) {
            if (root.left === null) {
                root.left = newNode;
                this.nodeCount++;
            } else {
                this.insertNode(root.left, newNode);
            }
        } else if (newNode.value > root.value) {
            if (root.right === null) {
                root.right = newNode;
                this.nodeCount++;
            } else {
                this.insertNode(root.right, newNode);
            }
        }
    }
    
    calculateTreeDepth(node) {
        if (!node) return 0;
        return 1 + Math.max(
            this.calculateTreeDepth(node.left),
            this.calculateTreeDepth(node.right)
        );
    }
    
    drawTree() {
        this.treeContainer.innerHTML = '';
        if (!this.root) return;
        
        const treeWidth = this.treeContainer.offsetWidth;
        const treeDepth = this.calculateTreeDepth(this.root);
        const startX = treeWidth / 2;
        const baseSpacing = Math.min(treeWidth * 0.4, 200);
        
        this.calculatePositions(this.root, startX, 30, baseSpacing, treeDepth);
        this.drawNode(this.root);
        
        // Store original positions
        this.storeOriginalPositions(this.root);
    }
    
    calculatePositions(node, x, y, horizontalSpacing, maxDepth, depth = 0) {
        if (!node) return;
        
        // Calculate dynamic spacing based on depth to prevent overlap
        const spacing = horizontalSpacing * Math.pow(0.6, depth/maxDepth);
        
        node.x = x;
        node.y = y;
        node.depth = depth;
        
        if (node.left) {
            this.calculatePositions(node.left, x - spacing, y + 80, horizontalSpacing, maxDepth, depth + 1);
        }
        if (node.right) {
            this.calculatePositions(node.right, x + spacing, y + 80, horizontalSpacing, maxDepth, depth + 1);
        }
    }
    
    storeOriginalPositions(node) {
        if (!node) return;
        
        node.originalX = node.x;
        node.originalY = node.y;
        
        this.storeOriginalPositions(node.left);
        this.storeOriginalPositions(node.right);
    }
    
    drawNode(node) {
        if (!node) return;
        
        // Create node element
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.textContent = node.value;
        nodeElement.style.left = `${node.x - 20}px`;
        nodeElement.style.top = `${node.y - 20}px`;
        nodeElement.dataset.value = node.value;
        nodeElement.style.background = this.getNodeColor(node.value);
        this.treeContainer.appendChild(nodeElement);
        node.element = nodeElement;
        
        // Draw connector to parent if exists
        if (node.depth > 0) {
            const parent = this.findParent(this.root, node.value);
            if (parent) {
                const connector = document.createElement('div');
                connector.className = 'connector';
                
                const length = Math.sqrt(Math.pow(node.x - parent.x, 2) + Math.pow(node.y - parent.y, 2));
                const angle = Math.atan2(node.y - parent.y, node.x - parent.x) * 180 / Math.PI;
                
                connector.style.width = `${length}px`;
                connector.style.left = `${parent.x}px`;
                connector.style.top = `${parent.y}px`;
                connector.style.transform = `rotate(${angle}deg)`;
                
                this.treeContainer.appendChild(connector);
            }
        }
        
        // Recursively draw children
        this.drawNode(node.left);
        this.drawNode(node.right);
    }
    
    findParent(root, value, parent = null) {
        if (!root) return null;
        if (root.value === value) return parent;
        
        if (value < root.value) {
            return this.findParent(root.left, value, root);
        } else {
            return this.findParent(root.right, value, root);
        }
    }
    
    generateTraversalSteps() {
        this.traversalSteps = [];
        this.inorderTraversal(this.root);
        return this.traversalSteps;
    }
    
    inorderTraversal(node) {
        if (!node) return;
        
        this.inorderTraversal(node.left);
        this.traversalSteps.push(node);
        this.inorderTraversal(node.right);
    }
    
    startTraversal() {
        if (!this.root) {
            alert('Please build a tree first!');
            return;
        }
        
        // Reset the tree visualization first
        this.resetVisualization();
        
        // Then start the traversal
        this.generateTraversalSteps();
        if (this.traversalSteps.length === 0) return;
        
        this.traversalDisplay.innerHTML = '';
        this.currentStep = 0;
        this.startBtn.disabled = true;
        this.addBtn.disabled = true;
        
        this.animationInterval = setInterval(() => {
            if (this.currentStep >= this.traversalSteps.length) {
                clearInterval(this.animationInterval);
                this.startBtn.disabled = false;
                this.addBtn.disabled = false;
                return;
            }
            
            this.animateStep(this.traversalSteps[this.currentStep]);
            this.currentStep++;
        }, 1000);
    }
    
    resetVisualization() {
        // Reset all nodes to their original positions
        this.resetNodePositions(this.root);
        
        // Redraw the tree
        this.treeContainer.innerHTML = '';
        this.drawTree();
    }
    
    resetNodePositions(node) {
        if (!node) return;
        
        node.x = node.originalX;
        node.y = node.originalY;
        
        this.resetNodePositions(node.left);
        this.resetNodePositions(node.right);
    }
    
    animateStep(node) {
        // Highlight the current node
        node.element.classList.add('highlight');
        
        // Make the node fall
        node.element.classList.add('falling');
        
        // When animation completes, add to traversal display
        setTimeout(() => {
            // Hide the original node (it's now in the traversal display)
            node.element.style.visibility = 'hidden';
            
            // Create a new node in the traversal display
            this.addToTraversalDisplay(node.value);
        }, 900);
    }
    
    addToTraversalDisplay(value) {
        const node = document.createElement('div');
        node.className = 'traversal-node';
        node.textContent = value;
        node.style.background = this.getNodeColor(value);
        node.style.animationDelay = `${this.currentStep * -0.8}s`;
        this.traversalDisplay.appendChild(node);
    }
    
    getNodeColor(value) {
        const colors = ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0', '#4895ef'];
        return colors[value % colors.length];
    }
    
    resetTree() {
        clearInterval(this.animationInterval);
        this.root = null;
        this.traversalSteps = [];
        this.currentStep = 0;
        this.treeContainer.innerHTML = '';
        this.traversalDisplay.innerHTML = '';
        this.startBtn.disabled = false;
        this.addBtn.disabled = false;
        this.nodeValueInput.focus();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TreeVisualizer();
});
