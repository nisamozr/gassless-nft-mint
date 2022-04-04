//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract EYENFTS is ERC721Enumerable, ERC2771Context, ERC2981{
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    uint256 public constant MAX_SUPPLY = 3000;
    uint256 public constant MAX_PER_MINT = 1;
    bytes32 private merkleRoot;
    address public owner;
    string public baseURI;
    string public baseExtension = ".json";

    mapping(address => bool) public whitelistClaimed;
    event Mint(address minter, uint256 tokenId);

    constructor(
        address trustedForwarder, 
        string memory _initBaseURI, 
        uint96 _royality
    ) 
    ERC721("EYE ON", "EYE") 
    ERC2771Context(trustedForwarder)  
    {
        owner = msg.sender;
        _setDefaultRoyalty(msg.sender, _royality);
        setBaseURI(_initBaseURI);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function setMerklRoot(bytes32 _merklroot) external onlyOwner{
        merkleRoot = _merklroot;
    }
  
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function mintNFT(bytes32[] calldata _merkleProof) public  {
        uint256 totalMinted = _tokenIds.current();
        require(totalMinted < MAX_SUPPLY, "Not enough NFTs left!");
        require(balanceOf(_msgSender()) <= MAX_PER_MINT, "Cannot mint specified number of NFTs.");
        require(!whitelistClaimed[_msgSender()], "Address already claimed");
        bytes32 leaf = keccak256(abi.encodePacked(_msgSender()));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf),"Invalid Merkle Proof.");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        whitelistClaimed[_msgSender()] = true;
        _safeMint(_msgSender(), tokenId);
        emit Mint(_msgSender(), tokenId);
    }

    function getMerkelRoot() external view returns(bytes32){
        return merkleRoot;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns(string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address sender) {
        sender = ERC2771Context._msgSender();
    }

    /// @inheritdoc	ERC2771Context
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata){
        return ERC2771Context._msgData();
    }
     function supportsInterface(bytes4 interfaceId) public view virtual override( ERC2981,ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
     function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
