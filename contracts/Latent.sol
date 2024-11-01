// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./libraries/Encode.sol";
import "./libraries/SSTORE2.sol";
import "./ERC721.sol";

/// @title Latent
/// @author VisualizeValue
contract Latent is ERC721 {

    string public constant name        = "Latent";
    string public constant symbol      = "LATENT";
    string public constant description = "80 surrealist works exploring the space between real and realized, "
                                         "premiering at Paris Photo 2024 on surrealism's centennial. "
                                         "Each token serves as an original digital negative, "
                                         "materializing as Silver Gelatin Prints "
                                         "via Paris's historic PICTO laboratory.";
    string public constant contentId   = "QmNT8pBktjfhQvLK7YAGubFEBn1Z1DKDM5zGtyufuWiKwS";

    // @dev Token names storage locations
    address private nameStorage;

    constructor (bytes memory encodedNames) {
        // Store the token names
        nameStorage = SSTORE2.write(encodedNames);

        // Mint the collection
        for (uint256 token = 1; token <= 80; token++) {
            _update(msg.sender, token, address(0));
        }
    }

    /// @notice Collection meta data
    function contractURI() external pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked('{'
            '"name": "', name, '",'
            '"description": "', description, '",'
            '"image": "ipfs://', contentId, '/positive/1.jpg"'
        '}');

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    /// @notice Token URI information getter
    /// @param tokenId The token ID get the uri for
    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        _requireOwned(tokenId);

        string memory id = Strings.toString(tokenId);

        return Encode.json(abi.encodePacked(
            '{'
                '"id": ', id, ','
                '"name": "', tokenName(tokenId), '",'
                '"description": "Digital Negative, Latent (', id, ' of 80)",'
                '"image": "ipfs://', contentId, '/negative/', id, '.jpg",'
                '"animation_url": "', Encode.svg(bytes(tokenAnimation(tokenId, 'https://ipfs.vv.xyz/ipfs'))), '",'
                '"attributes": ['
                    '{'
                        '"trait_type": "Artist",'
                        '"value": "Jack Butcher"'
                    '}'
                ']'
            '}'
        ));
    }

    /// @notice Get the name for a given token
    /// @param tokenId The token ID get the uri for
    function tokenName(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);

        string[] memory names = abi.decode(SSTORE2.read(nameStorage), (string[]));

        return names[tokenId - 1];
    }

    /// @notice Get the animation SVG for a given token
    /// @param tokenId The token ID get the uri for
    function tokenAnimation(uint256 tokenId) public view returns (string memory) {
        return tokenAnimation(tokenId, "https://ipfs.vv.xyz/ipfs");
    }

    /// @notice Get the animation SVG for a given token, resolving them via a custom IPFS gateway
    /// @param tokenId The token ID get the uri for
    /// @param gateway The IPFS gateway to use to resolve the images
    function tokenAnimation(uint256 tokenId, string memory gateway) public view returns (string memory) {
        _requireOwned(tokenId);

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2160 2160">'
                '<!-- IMAGES -->'
                '<image href="', gateway, '/', contentId, '/positive/', Strings.toString(tokenId), '.jpg" height="2160" width="2160" opacity="0">'
                    '<animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="positive.begin" fill="freeze"/>'
                '</image>'
                '<image href="', gateway, '/', contentId, '/negative/', Strings.toString(tokenId), '.jpg" height="2160" width="2160">'
                    '<animate attributeName="opacity" from="1" to="0" dur="0.4s" begin="positive.begin" fill="freeze"/>'
                    '<animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="negative.begin" fill="freeze"/>'
                '</image>'

                '<!-- CONTROLS -->'
                '<rect width="0" height="2160" fill="transparent">'
                    '<animate attributeName="width" from="2160" to="0" dur="0.4s" begin="click" fill="freeze" id="negative" />'
                    '<animate attributeName="width" from="0" to="2160" dur="0.4s" begin="positive.begin" fill="freeze" />'
                '</rect>'
                '<rect width="2160" height="2160" fill="transparent">'
                    '<animate attributeName="width" from="0" to="2160" dur="0.4s" begin="negative.begin" fill="freeze" />'
                    '<animate attributeName="width" from="2160" to="0" dur="0.4s" begin="click" fill="freeze" id="positive" />'
                '</rect>'
            '</svg>'
        ));
    }
}

