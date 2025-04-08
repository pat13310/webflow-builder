$propertyFiles = Get-ChildItem -Path "src\components\properties" -Filter "*.tsx"

foreach ($file in $propertyFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Corriger l'import du type Node
    if ($content -match "import .*Node.*reactflow") {
        $content = $content -replace "import \{ Node \} from 'reactflow';", "import type { Node as FlowNode } from 'reactflow';"
    }
    
    # Remplacer Node par FlowNode dans l'interface
    $content = $content -replace "selectedNode: Node;", "selectedNode: FlowNode;"
    
    # Remplacer la fonction handleInputChange par useNodeProperties si elle existe
    if ($content -match "handleInputChange") {
        $content = $content -replace "const handleInputChange = \(field: string, value: any\) => {[\s\S]*?};", "const { handlePropertyChange } = useNodeProperties(selectedNode, onNodeUpdate);"
        
        # Remplacer tous les appels à handleInputChange par handlePropertyChange
        $content = $content -replace "onChange={\(e\) => handleInputChange", "onChange={(e) => handlePropertyChange"
    }
    
    # Sauvegarder les modifications
    $content | Set-Content $file.FullName -NoNewline
}
