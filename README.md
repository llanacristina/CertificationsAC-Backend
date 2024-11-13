# CertificationsAC-Backend

Este repositório contém o backend do projeto CertificationsAC e inclui o submódulo `fabric-samples`, que é um repositório externo com exemplos do Hyperledger Fabric.


### Explicação das Etapas:

1. **Clonar o Repositório**: O primeiro passo é clonar o repositório principal. O comando `git clone` irá copiar todos os arquivos do repositório para sua máquina local.
  
2. **Entrar no Diretório do Repositório Clonado**: Depois de clonar o repositório, é necessário navegar até a pasta do repositório, com o comando:
```
cd CerticationsAC-Backend
```
3. **Inicializar e Baixar o Submódulo**: O submódulo `fabric-samples` é um repositório externo dentro do seu repositório principal. Agora que você está dentro da pasta do repositório clonado, execute o comando para baixar os arquivos do submódulo:

 ```
 git submodule update --init --recursive
 ``` 
 
 Vai baixar a pasta `fabric-samples` e todos os arquivos relacionados a esse submódulo.

4. **Verificar os Arquivos**: Após o comando de atualização, você pode verificar se os arquivos foram baixados corretamente na pasta `fabric-samples` usando o comando:

```
ls fabric-samples
```

### Resultado Esperado:

- A pasta `fabric-samples` no seu repositório será populada com os arquivos necessários do Hyperledger Fabric.
- Você poderá continuar a configuração do seu projeto com esses arquivos.

