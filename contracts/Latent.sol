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
    string public constant description = "The infinite between.";
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

        return Encode.json(abi.encodePacked(
            '{'
                '"id": ', Strings.toString(tokenId), ','
                '"name": "', tokenName(tokenId), '",'
                '"description": "Digital negative as primary artifact.",',
                '"image": "ipfs://', contentId, '/negative/', Strings.toString(tokenId), '.jpg",'
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
}

